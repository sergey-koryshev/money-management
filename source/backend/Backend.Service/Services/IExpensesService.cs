using Backend.Domain.DTO;
using Backend.Domain.Models;

namespace Backend.Service;

public interface IExpensesService
{
    public List<ExpenseDto> GetExpenses(ExpensesFilterDto filter);

    public ExpenseDto CreateExpense(ChangeExpenseParamsDto changeParams);

    public List<ExtendedExpenseNameDto> SearchExpenseNames(string term);
}
