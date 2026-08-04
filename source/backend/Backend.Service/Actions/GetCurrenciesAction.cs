namespace Backend.Service.Actions;

using Backend.Application;
using Backend.Domain.Models;
using Backend.Infrastructure;

public class GetCurrenciesAction : ActionBase<List<Currency>>
{
    public GetCurrenciesAction()
    {
    }

    protected override List<Currency> ExecuteInternal(AppDbContext dbContext, Domain.Entities.Person identity)
    {
        var result = new CurrenciesRepository(dbContext, identity).GetAllCurrencies();
        return result;
    }
}