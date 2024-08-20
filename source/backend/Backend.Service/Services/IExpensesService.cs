using Backend.Domain.DTO;

namespace Backend.Service;

public interface IExpensesService
{
    public List<ExpenseDto> GetExpenses(ExpensesFilterDto filter);

    public ExpenseDto CreateExpense(ChangeExpenseParamsDto changeParams);

    public ExpenseDto UpdateExpense(int expenseId, ChangeExpenseParamsDto changeParams);

    public void DeleteExpense(int expenseId);

    public List<ExtendedExpenseNameDto> SearchExpenseNames(string term);
}
