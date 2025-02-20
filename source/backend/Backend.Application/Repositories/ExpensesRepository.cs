namespace Backend.Application;

using Backend.Application.Clients;
using Backend.Domain.Extensions;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Entities = Domain.Entities;

public class ExpensesRepository
{
    private const int maxNamesSearchResults = 5;

    private const double minTrigramsSimilarity = 0.1;

    private const int createdByFilterOptionMe = 0;

    private const int createdByFilterOptionNotMe = -1;

    private readonly AppDbContext dbContext;

    private readonly Entities.Person identity;

    private readonly CategoriesRepository categoriesRepository;

    private readonly ConnectionsRepository connectionsRepository;

    private readonly CurrenciesRepository currenciesRepository;

    private readonly IExchangeServerClient? exchangeServerClient;

    public ExpensesRepository(AppDbContext dbContext, Entities.Person identity, IExchangeServerClient? exchangeServerClient = null)
    {
        this.dbContext = dbContext;
        this.identity = identity;
        this.exchangeServerClient = exchangeServerClient;
        this.categoriesRepository = new CategoriesRepository(dbContext, identity);
        this.connectionsRepository = new ConnectionsRepository(dbContext, identity);
        this.currenciesRepository = new CurrenciesRepository(dbContext, identity);
    }

    public Expense CreateExpense(ChangeExpenseParams changeParams)
    {
        this.ValidateChangeParams(changeParams);

        var entity = this.CreateOrUpdateEntity(changeParams);
        this.dbContext.Expenses.Add(entity).Reference(e => e.Category).Query().Include(c => c.PermittedPersons).Load();
        this.dbContext.SaveChanges();

        var exchangedPrice = this.GetExchangedPrice(entity);
        return entity.ToModel(exchangedPrice);
    }

    public List<Expense> GetExpenses(ExpensesFilter? filter = null)
    {
        var filteredExpenses = this.GetExpensesQuery(filter).ToList();

        Dictionary<int, Price> expenseIdToExchangedPrice = this.GetExchangedPrices(filteredExpenses);
        return filteredExpenses.Select(e => e.ToModel(expenseIdToExchangedPrice.ContainsKey(e.Id) ? expenseIdToExchangedPrice[e.Id] : null)).ToList();
    }

    public Expense UpdateExpense(int id, ChangeExpenseParams changeParams)
    {
        var entity = this.GetExpenseEntityById(id);

        this.ValidateChangeParams(changeParams, entity);

        this.CreateOrUpdateEntity(changeParams, entity);
        this.dbContext.SaveChanges();

        this.dbContext.Entry(entity).Reference(e => e.Category).Query().Include(c => c.PermittedPersons).Load();

        var exchangedPrice = this.GetExchangedPrice(entity);
        return entity.ToModel(exchangedPrice);
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
            if (filter.Month != null && filter.Year != null && !string.IsNullOrWhiteSpace(filter.TimeZone))
            {
                var startDate = new DateTime(filter.Year.Value, filter.Month.Value, 1);
                var endDate = startDate.AddMonths(1);
        
                var timeZone = TimeZoneInfo.FindSystemTimeZoneById(filter.TimeZone);
                var startDateUtc = TimeZoneInfo.ConvertTimeToUtc(startDate, timeZone);
                var endDateUtc = TimeZoneInfo.ConvertTimeToUtc(endDate, timeZone);

                query = query.Where(e => e.Date >= startDateUtc && e.Date < endDateUtc);
            }

            if (!string.IsNullOrWhiteSpace(filter.SearchingTerm))
            {
                query = query.Where(e => EF.Functions.TrigramsSimilarity(EF.Functions.Unaccent(e.Name), EF.Functions.Unaccent(filter.SearchingTerm)) > minTrigramsSimilarity
                    || (e.Description != null && EF.Functions.TrigramsSimilarity(EF.Functions.Unaccent(e.Description), EF.Functions.Unaccent(filter.SearchingTerm)) > minTrigramsSimilarity));
            }

            if (filter.CreatedById != null)
            {
                switch (filter.CreatedById)
                {
                    case createdByFilterOptionMe:
                        query = query.Where(e => e.CreatedById == this.identity.Id);
                        break;
                    case createdByFilterOptionNotMe:
                        query = query.Where(e => e.CreatedById != this.identity.Id);
                        break;
                }
            }

            if (filter.Shared != null)
            {
                query = query.Where(e => e.PermittedPersons.Any(p => p.Id != this.identity.Id) == filter.Shared);
            }

            if (!filter.CategoryName.IsEmpty())
            {
                query = query.Where(e => filter.CategoryName!.Contains(e.Category!.Name));
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

        if (string.IsNullOrWhiteSpace(changeParams.Name))
        {
            throw new InvalidOperationException("Expense can't contain empty name.");
        }

        // check if specified currency exists
        var currency = this.dbContext.Currencies.Find(changeParams.CurrencyId);

        if (currency == null)
        {
            throw new InvalidOperationException($"Currency with id '{changeParams.CurrencyId}' doesn't exist.");
        }

        var connectedPersonsIds = this.connectionsRepository.GetConnectedPersonsIds(true);

        // restrict edit action for users which are not connected to creator or not exist in permitted list
        if (entity != null && entity.CreatedById != this.identity.Id && (!entity.PermittedPersons.Where(p => p.Id == this.identity.Id).Any() || !connectedPersonsIds.Contains(this.identity.Id)))
        {
            throw new InvalidOperationException("You don't have permissions to edit the expense.");
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
                var connectedPermittedPersonsIds = connectedPersonsIds.Where(permittedPersonsIds.Contains).ToHashSet();

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

        // only creator can change list of permitted persons
        var permittedPersonsIds = entity != null && entity.CreatedById != this.identity.Id ? entity.PermittedPersons.Select(p => p.Id).ToHashSet() : changeParams.PermittedPersonsIds.ToHashSet();

        // need to ensure that creator is always in list of permitted users
        if ((entity == null || entity.CreatedById == this.identity.Id) && !permittedPersonsIds.Contains(this.identity.Id))
        {
            permittedPersonsIds.Add(this.identity.Id);
        }

        var permittedPersons = this.dbContext.Persons.Where(p => permittedPersonsIds.Contains(p.Id)).ToList();

        if (!string.IsNullOrWhiteSpace(changeParams.CategoryName))
        {
            var resolvedCategory = this.categoriesRepository.GetCategoriesQuery()
                .Where(c => c.Name == changeParams.CategoryName)
                .Select(c => new { CategoryId = c.Id, c.CreatedById, MatchedPersonsAmount = c.PermittedPersons.Where(p => permittedPersonsIds.Contains(p.Id)).Count()}) // need to check if permittedPersonsIds.Contains(p.Id)).Count() works efficiently
                .Where(o => o.CreatedById == this.identity.Id || o.MatchedPersonsAmount == permittedPersonsIds.Count)
                .OrderByDescending(o => o.CreatedById == (entity != null ? entity.CreatedById : this.identity.Id))
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
                categoryId = resolvedCategory.CategoryId;

                if (resolvedCategory.CreatedById == this.identity.Id)
                {
                    this.categoriesRepository.UpdatePermittedPersonsList(resolvedCategory.CategoryId, permittedPersonsIds);
                }
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
            entity.PermittedPersons = permittedPersons;

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
        var entity = this.GetExpensesQuery().Include(e => e.Category).FirstOrDefault(e => e.Id == id);

        if (entity == null)
        {
            throw new InvalidOperationException($"Expense with id '{id}' doesn't exist.");
        }

        return entity;
    }

    private Dictionary<int, Price> GetExchangedPrices(List<Entities.Expense> expenses)
    {
        if (this.exchangeServerClient == null || expenses.IsEmpty())
        {
            return new Dictionary<int, Price>();
        }

        var mainCurrency = this.currenciesRepository.GetMainCurrency();

        if (mainCurrency == null)
        {
            return new Dictionary<int, Price>();
        }

        Dictionary<DateTime, Dictionary<string, double>> exchangeRates =
            this.exchangeServerClient.GetExchangeRates(expenses.Min(e => e.Date), expenses.Max(e => e.Date), mainCurrency.Name);

        return expenses
            .Where(e => e.Currency!.Id != mainCurrency.Id)
            .ToDictionary(e => e.Id, e => this.ExchangePrice(exchangeRates, e, mainCurrency));
    }

    private Price? GetExchangedPrice(Entities.Expense expense)
    {
        var result = this.GetExchangedPrices(new List<Entities.Expense>{ expense });
        return result.Count > 0 ? result.First().Value : null;
    }

    private Price ExchangePrice(Dictionary<DateTime, Dictionary<string, double>> exchangeRates, Entities.Expense expense, Currency mainCurrency)
    {
        if (!exchangeRates.IsEmpty())
        {
            var targetRates = exchangeRates.Where(x => x.Key <= expense.Date);
            var diffPredicate = (KeyValuePair<DateTime, Dictionary<string, double>> x) => Math.Abs((x.Key - expense.Date).Ticks);
            var nearestDiff = targetRates.Min(diffPredicate);

            var dateNode = targetRates.Where(x => diffPredicate(x) == nearestDiff).FirstOrDefault();

            if (dateNode.Value != null && dateNode.Value.TryGetValue(expense.Currency!.Name, out var exchangeRate))
            {
                Failure? exchangeFailure = null;

                if (expense.Date - dateNode.Key > TimeSpan.FromDays(2))
                {
                    exchangeFailure = new Failure
                    {
                        Type = FailureType.Warning,
                        Message = "There is no data for expense date, so the exchanged price can be inaccurate."
                    };
                }

                return new Price
                {
                    Amount = expense.PriceAmount / exchangeRate,
                    Currency = mainCurrency,
                    ExchangeRate = 1 / exchangeRate,
                    ExchangeRateDate = dateNode.Key,
                    ExchangeFailure = exchangeFailure
                };
            }
        }

        return new Price
        {
            Amount = expense.PriceAmount,
            Currency = expense.Currency!.ToModel(),
            ExchangeFailure = new Failure
            {
                Type = FailureType.Error,
                Message = "There is no data to exchange the price. In case the issue persists, contact administrator."
            }
        };
    }
}
