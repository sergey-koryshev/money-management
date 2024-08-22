﻿namespace Backend.Application;

using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Entities = Domain.Entities;

public class ExpensesRepository
{
    private const int maxNamesSearchResults = 5;

    private const double minTrigramsSimilarity = 0.1;

    private readonly AppDbContext dbContext;

    private readonly Entities.Person identity;

    private readonly CategoriesRepository categoriesRepository;

    private readonly ConnectionsRepository connectionsRepository;

    private readonly CurrenciesRepository currenciesRepository;

    public ExpensesRepository(AppDbContext dbContext, Entities.Person identity)
    {
        this.dbContext = dbContext;
        this.identity = identity;
        this.categoriesRepository = new CategoriesRepository(dbContext, identity);
        this.connectionsRepository = new ConnectionsRepository(dbContext, identity);
        this.currenciesRepository = new CurrenciesRepository(dbContext, identity);
    }

    public Expense CreateExpense(ChangeExpenseParams changeParams)
    {
        this.ValidateChangeParams(changeParams);

        var entity = this.CreateOrUpdateEntity(changeParams);
        this.dbContext.Expenses.Add(entity);
        this.dbContext.SaveChanges();

        var mainCurrency = this.currenciesRepository.GetMainCurrency();
        Price? convertedPrice = null;

        if (mainCurrency != null)
        {
            convertedPrice = this.ConvertPrice(entity, mainCurrency);
        }

        return entity.ToModel(convertedPrice);
    }

    public List<Expense> GetExpenses(ExpensesFilter? filter = null)
    {
        var filteredExpenses = this.GetExpensesQuery(filter).ToList();

        var mainCurrency = this.currenciesRepository.GetMainCurrency();
        Dictionary<int, Price> expenseIdToExchangedPrice = new Dictionary<int, Price>();

        if (mainCurrency != null)
        {
            expenseIdToExchangedPrice = this.ConvertPrices(filteredExpenses, mainCurrency);
        }

        return filteredExpenses.Select(e => e.ToModel(mainCurrency != null && expenseIdToExchangedPrice.ContainsKey(e.Id) ? expenseIdToExchangedPrice[e.Id] : null)).ToList();
    }

    public Expense UpdateExpense(int id, ChangeExpenseParams changeParams)
    {
        var entity = this.GetExpenseEntityById(id);

        this.ValidateChangeParams(changeParams, entity);

        this.CreateOrUpdateEntity(changeParams, entity);
        this.dbContext.SaveChanges();

        var mainCurrency = this.currenciesRepository.GetMainCurrency();
        Price? convertedPrice = null;

        if (mainCurrency != null)
        {
            convertedPrice = this.ConvertPrice(entity, mainCurrency);
        }

        return entity.ToModel(convertedPrice);
    }

    public void DeleteExpense(int id)
    {
        var entity = this.GetExpenseEntityById(id);

        if (entity.CreatedById == this.identity.Id)
        {
            this.dbContext.Expenses.Remove(entity);
        }
        else
        {
            entity.PermittedPersons = entity.PermittedPersons.Where(p => p.Id != this.identity.Id).ToList();
        }
        
        this.dbContext.SaveChanges();
    }

    public List<ExtendedExpenseName> FindExpenseNames(string term)
    {
        return this.GetExpensesQuery()
            .Where(e => EF.Functions.TrigramsSimilarity(EF.Functions.Unaccent(e.Name), EF.Functions.Unaccent(term)) > minTrigramsSimilarity)
            .Select(e => new { e.Name, CategoryName = e.CategoryId == null ? null : e.Category!.Name, Similarity = EF.Functions.TrigramsSimilarity(EF.Functions.Unaccent(e.Name), EF.Functions.Unaccent(term)) })
            .Distinct()
            .OrderByDescending(o => o.Similarity)
            .Take(maxNamesSearchResults)
            .Select(o => new ExtendedExpenseName
            {
                Name = o.Name,
                CategoryName = o.CategoryName
            })
            .ToList();
    }

    internal IQueryable<Entities.Expense> GetExpensesQuery(ExpensesFilter? filter = null)
    {
        var query = this.dbContext.Expenses
            .Include(c => c.Category)
            .Include(c => c.Currency)
            .Include(c => c.CreatedBy)
            .Include(c => c.PermittedPersons)
            .Where(c => c.PermittedPersons.Any(p => p.Id == this.identity.Id));
        
        if (filter != null)
        {
            if (filter.Month != null && filter.Year != null)
            {
                var startDate = new DateTime(filter.Year.Value, filter.Month.Value, 1).ToUniversalTime();
                var endDate = startDate.AddMonths(1);
                query = query.Where(e => e.Date >= startDate && e.Date < endDate);
            }

            if (!string.IsNullOrWhiteSpace(filter.SearchingTerm))
            {
                query = query.Where(e => EF.Functions.TrigramsSimilarity(EF.Functions.Unaccent(e.Name), EF.Functions.Unaccent(filter.SearchingTerm)) > minTrigramsSimilarity
                    || (e.Description != null && EF.Functions.TrigramsSimilarity(EF.Functions.Unaccent(e.Description), EF.Functions.Unaccent(filter.SearchingTerm)) > minTrigramsSimilarity));

            }
        }

        return query;
    }

    private void ValidateChangeParams(ChangeExpenseParams changeParams, Entities.Expense? entity = null)
    {
        if (changeParams == null)
        {
            throw new ArgumentNullException(nameof(changeParams));
        }

        var connectedPersonsIds = this.connectionsRepository.GetConnectedPersonsIds(true);

        // restrict edit action for users which are not connected to creator or not exist in permitted list
        if (entity != null && entity.CreatedById != this.identity.Id && (!entity.PermittedPersons.Where(p => p.Id == this.identity.Id).Any() || !connectedPersonsIds.Contains(this.identity.Id)))
        {
            throw new InvalidOperationException("You don't have permissions to edit the expense.");
        }

        // check if specified currency exists
        var currency = this.dbContext.Currencies.Find(changeParams.CurrencyId);

        if (currency == null)
        {
            throw new InvalidOperationException($"Currency with id '{changeParams.CurrencyId}' doesn't exist.");
        }

        // we need to validate list of permitted persons only if the expense is edited by creator or during creation new expense
        if (entity == null || entity.CreatedById == this.identity.Id)
        {
            var permittedPersonsIds = changeParams.PermittedPersonsIds.ToHashSet();

            if (permittedPersonsIds.Any())
            {
                if (entity != null && entity.PermittedPersons.Any())
                {
                    // we need to exclude persons which already has permissions to manage this expense even they are not connected to the user anymore
                    var existingPermittedPersons = entity.PermittedPersons.Select(p => p.Id).ToHashSet();
                    permittedPersonsIds.RemoveWhere(existingPermittedPersons.Contains);
                }

                // check if all specified persons connected with the user
                var connectedPermittedPersonsIds = this.connectionsRepository.GetConnectedPersonsIds(true).Where(permittedPersonsIds.Contains).ToHashSet();

                if (permittedPersonsIds.Count != connectedPermittedPersonsIds.Count)
                {
                    var notPermittedPersonsIds = permittedPersonsIds.Where(id => !connectedPermittedPersonsIds.Contains(id)).ToHashSet();
                    throw new InvalidOperationException(string.Format(
                        "You cannot share this expense with users '{0}' since you don't have connections with them.",
                        string.Join(", ", notPermittedPersonsIds)
                    ));
                }
            }
        }
    }

    private Entities.Expense CreateOrUpdateEntity(ChangeExpenseParams changeParams, Entities.Expense? entity = null)
    {
        int? categoryId = null;

        var permittedPersonsIds = changeParams.PermittedPersonsIds.ToHashSet();

        // need to ensure that creator is always in list of permitted users
        if ((entity == null || entity.CreatedById == this.identity.Id) && !permittedPersonsIds.Contains(this.identity.Id))
        {
            permittedPersonsIds.Add(this.identity.Id);
        }

        var permittedPersons = this.dbContext.Persons.Where(p => permittedPersonsIds.Contains(p.Id)).ToList();

        if (!string.IsNullOrWhiteSpace(changeParams.CategoryName))
        {
            // Category name resolves to category be the following rules:
            // 1) Filtered by name
            // 2) Placed categories created by entity's owner at the top
            // 3) Sorted by amount of desired persons in permitted persons list
            // 4) Take first found category
            var resolvedCategory = this.categoriesRepository.GetCategoriesQuery()
                .Where(c => c.Name == changeParams.CategoryName)
                .OrderByDescending(i => i.CreatedById == (entity != null ? entity.CreatedById : this.identity.Id))
                    .ThenBy(c => c.PermittedPersons.Where(p => permittedPersonsIds.Contains(p.Id)).Count())
                .FirstOrDefault();

            if (resolvedCategory == null)
            {
                categoryId = this.categoriesRepository.CreateCategory(new Category
                {
                    Name = changeParams.CategoryName,
                    CreatedBy = this.identity.ToModel(),
                    PermittedPersons = permittedPersons.Select(p => p.ToModel()).ToList()
                });
            }
            else
            {
                categoryId = resolvedCategory.Id;
                this.categoriesRepository.UpdatePermittedPersonsList(resolvedCategory.Id, permittedPersonsIds);
            }
        }

        if (entity != null)
        {
            entity.Date = changeParams.Date;
            entity.Name = changeParams.Name;
            entity.Description = changeParams.Description;
            entity.CategoryId = categoryId;
            entity.PriceAmount = changeParams.PriceAmount;
            entity.CurrencyId = changeParams.CurrencyId;

            // only creator can change list of permitted persons
            if (entity.CreatedById == this.identity.Id)
            {
                entity.PermittedPersons = permittedPersons;
            }

            return entity;
        }

        return new Entities.Expense
        {
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            CategoryId = categoryId,
            PriceAmount = changeParams.PriceAmount,
            CurrencyId = changeParams.CurrencyId,
            CreatedById = this.identity.Id,
            PermittedPersons = permittedPersons
        };
    }

    private Entities.Expense GetExpenseEntityById(int id)
    {
        var entity = this.GetExpensesQuery().FirstOrDefault(e => e.Id == id);

        if (entity == null)
        {
            throw new InvalidOperationException($"Expense with id '{id}' doesn't exist.");
        }

        return entity;
    }

    /// <summary>
    /// Fake method to convert prices.
    /// </summary>
    /// <param name="expenses">List of expenses.</param>
    /// <param name="mainCurrency">Main currency.</param>
    /// <returns>Dictionary which has expense id as key and exchanged price as value.</returns>
    private Dictionary<int, Price> ConvertPrices(List<Entities.Expense> expenses, Currency mainCurrency)
    {
        //var dates = expenses.Select(e => e.CreatedOn.Date).Distinct().ToList();
        //var currencies = expenses.Select(e => e.Currency!.Name).Distinct().ToList();

        var random = new Random();
        var randomExchangeRate = random.NextDouble() + random.NextDouble();

        return expenses.Where(e => e.Currency!.Id != mainCurrency.Id).ToDictionary(e => e.Id, e => new Price
        {
            Amount = e.PriceAmount * randomExchangeRate,
            Currency = mainCurrency
        });
    }

    /// <summary>
    /// Fake method to convert price.
    /// </summary>
    /// <param name="expense">The expense.</param>
    /// <param name="mainCurrency">Main currency.</param>
    /// <returns>Dictionary which has expense id as key and exchanged price as value.</returns>
    private Price? ConvertPrice(Entities.Expense expense, Currency mainCurrency)
    {
        var result = this.ConvertPrices(new List<Entities.Expense>{ expense }, mainCurrency);
        return result.Count > 0 ? result.First().Value : null;
    }
}