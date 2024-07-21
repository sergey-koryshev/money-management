namespace Backend.Service;

using AutoMapper;
using Backend.Application;
using Backend.Domain.DTO;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

public class CurrenciesService : ServiseBase, ICurrenciesService
{
    public CurrenciesService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory)
        : base(httpContextAccessor, mapper, dbContextFactory) {}
    
    public List<CurrencyDto> GetAllCurrencies()
    {
        this.ValidateUserIdentity();
        var result = new CurrenciesRepository(this.DbContextFactory.CreateDbContext(), this.Identity!).GetAllCurrencies();
        return result.Select(c => this.Mapper.Map<CurrencyDto>(c)).ToList();;
    }

    public CurrencyDto? GetMainCurrency()
    {
        this.ValidateUserIdentity();
        var result = new CurrenciesRepository(this.DbContextFactory.CreateDbContext(), this.Identity!).GetMainCurrency();
        return result != null ? this.Mapper.Map<CurrencyDto>(result) : null;
    }

    public void DeleteMainCurrency()
    {
        this.ValidateUserIdentity();
        new CurrenciesRepository(this.DbContextFactory.CreateDbContext(), this.Identity!).DeleteMainCurrency();
    }

    public CurrencyDto SetMainCurrency(int currencyId)
    {
        this.ValidateUserIdentity();
        var result = new CurrenciesRepository(this.DbContextFactory.CreateDbContext(), this.Identity!).SetMainCurrency(currencyId);
        return this.Mapper.Map<CurrencyDto>(result);
    }
}
