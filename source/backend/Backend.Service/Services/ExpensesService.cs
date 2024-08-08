using AutoMapper;
using Backend.Application;
using Backend.Domain.DTO;
using Backend.Domain.Models;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Backend.Service;

public class ExpensesService : ServiseBase, IExpensesService
{
    public ExpensesService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory) : base(httpContextAccessor, mapper, dbContextFactory)
    {
    }

    public List<ExpenseDto> GetExpenses(ExpensesFilterDto filter)
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            var connectedPersonsIds = this.GetConnectedPersonsIds(dbContext);

            var result = new ExpensesRepository(dbContext, this.Identity!).GetExpenses(this.Mapper.Map<ExpensesFilter>(filter));
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
            var connectedPersonsIds = this.GetConnectedPersonsIds(dbContext);

            var result = new ExpensesRepository(dbContext, this.Identity!).CreateExpense(this.Mapper.Map<ChangeExpenseParams>(changeParams));
            return this.Mapper.Map<ExpenseDto>(result, o => {
                o.Items["Identity"] = this.Identity;
                o.Items["ConnectedPersonsIds"] = connectedPersonsIds;
            });
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
