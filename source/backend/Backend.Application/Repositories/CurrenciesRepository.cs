namespace Backend.Application;

using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Entities = Domain.Entities;

public class CurrenciesRepository
{
    private readonly AppDbContext dbContext;

    private readonly Entities.Person identity;

    public CurrenciesRepository(AppDbContext dbContext, Entities.Person identity)
    {
        this.dbContext = dbContext;
        this.identity = identity;
    }

    public List<Currency> GetAllCurrencies()
    {
        return this.GetCurrencyMappingsQuery().OrderBy(m => m.Currency!.Name).Select(m => m.Currency!.ToModel()).ToList();
    }

    public Currency? GetMainCurrency()
    {
        return this.GetCurrencyMappingsQuery().FirstOrDefault(m => m.IsMainCurrency)?.Currency!.ToModel();
    }

    public Currency SetMainCurrency(int currencyId)
    {
        var mappingForTargetCurrency = this.GetCurrencyMappingsQuery().FirstOrDefault(m => m.CurrencyId == currencyId);

        if (mappingForTargetCurrency == null)
        {
            throw new InvalidOperationException($"Currency with Id '{currencyId}' is hidden or doesn't exist and cannot be set as main currency.");
        }

        var existingMappingWithMainCurrency = this.GetCurrencyMappingsQuery().FirstOrDefault(m => m.IsMainCurrency);

        if (existingMappingWithMainCurrency != null)
        {
            if (existingMappingWithMainCurrency.CurrencyId == currencyId)
            {
                return existingMappingWithMainCurrency.Currency!.ToModel();
            }

            existingMappingWithMainCurrency.IsMainCurrency = false;
        }

        mappingForTargetCurrency.IsMainCurrency = true;

        this.dbContext.SaveChanges();

        return mappingForTargetCurrency.Currency!.ToModel();
    }

    public void DeleteMainCurrency()
    {
        var existingMappingWithMainCurrency = this.GetCurrencyMappingsQuery().FirstOrDefault(m => m.IsMainCurrency);

        if (existingMappingWithMainCurrency != null)
        {
            existingMappingWithMainCurrency.IsMainCurrency = false;
        }

        this.dbContext.SaveChanges();
    }

    private IQueryable<Entities.CurrencyMapping> GetCurrencyMappingsQuery() {
        return this.dbContext.CurrencyMappings
            .Include(c => c.Currency)
            .Where(c => c.PersonId == this.identity.Id);
    }
}
