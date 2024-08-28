namespace Backend.Service;

using AutoMapper;
using Backend.Application;
using Backend.Domain.DTO;
using Backend.Domain.Models;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

public class ExpensesService : ServiseBase, IExpensesService
{
    public ExpensesService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory) : base(httpContextAccessor, mapper, dbContextFactory)
    {
    }

    public List<ExpenseDto> GetExpenses(ExpensesFilterDto filter)
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            var result = new ExpensesRepository(dbContext, this.Identity!).GetExpenses(this.Mapper.Map<ExpensesFilter>(filter));
            var connectedPersonsIds = this.GetConnectedPersonsIds(dbContext);
            return result.Select(e => this.Mapper.Map<ExpenseDto>(e, o => {
                o.Items["Identity"] = this.Identity;
                o.Items["ConnectedPersonsIds"] = connectedPersonsIds;
            })).ToList();
        });
    }

    public ExpenseDto CreateExpense(ChangeExpenseParamsDto changeParams)
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            var result = new ExpensesRepository(dbContext, this.Identity!).CreateExpense(this.Mapper.Map<ChangeExpenseParams>(changeParams));
            return this.Mapper.Map<ExpenseDto>(result, o => {
                o.Items["Identity"] = this.Identity;
                o.Items["ConnectedPersonsIds"] = this.GetConnectedPersonsIds(dbContext);;
            });
        });
    }

    public ExpenseDto UpdateExpense(int expenseId, ChangeExpenseParamsDto changeParams)
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            var result = new ExpensesRepository(dbContext, this.Identity!).UpdateExpense(expenseId, this.Mapper.Map<ChangeExpenseParams>(changeParams));
            
            return this.Mapper.Map<ExpenseDto>(result, o => {
                o.Items["Identity"] = this.Identity;
                o.Items["ConnectedPersonsIds"] = this.GetConnectedPersonsIds(dbContext);
            });
        });
    }

    public void DeleteExpense(int expenseId)
    {
        this.ExecuteActionInTransaction((dbContext) =>
        {
            new ExpensesRepository(dbContext, this.Identity!).DeleteExpense(expenseId);
        });
    }

    public List<ExtendedExpenseNameDto> SearchExpenseNames(string term)
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            var result = new ExpensesRepository(dbContext, this.Identity!).FindExpenseNames(term);
            return result.Select(r => this.Mapper.Map<ExtendedExpenseNameDto>(r)).ToList();
        });
    }

    private HashSet<int> GetConnectedPersonsIds(AppDbContext dbContext)
    {
        var connectedPersonsIds = new ConnectionsRepository(dbContext, this.Identity!)
                .GetConnectedPersonsIds(true);

        // need to add yourself to let mapper resolve your details correctly
        connectedPersonsIds.Add(this.Identity!.Id);

        return connectedPersonsIds;
    }
}
