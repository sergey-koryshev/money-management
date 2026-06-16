using Backend.Application;
using Backend.Domain.Models;
using Backend.Infrastructure;

namespace Backend.Service.Actions;

public class GetExpensesAction : ActionBase<List<Expense>>
{
    private ExpensesFilter Filter { get; }

    public GetExpensesAction(ExpensesFilter filter)
    {
        this.Filter = filter;
    }

    protected override ActionMessage GetMessage()
    {
        return ActionMessage.Create()
            .Add("Month", this.Filter.Month)
            .Add("Year", this.Filter.Year)
            .Add("TimeZone", this.Filter.TimeZone)
            .Add("SearchingTerm", this.Filter.SearchingTerm)
            .Add("CreatedById", this.Filter.CreatedById)
            .Add("Shared", this.Filter.Shared)
            .Add("CategoryName", this.Filter.CategoryName)
            .Add("Name", this.Filter.Name)
            .Add("CurrencyId", this.Filter.CurrencyId);
    }

    protected override List<Expense> ExecuteInternal(AppDbContext dbContext, Domain.Entities.Person identity)
    {
        var result = new ExpensesRepository(dbContext, identity).GetExpenses(this.Filter);
        return result;
    }
}