namespace Backend.Service;

using Backend.Domain.DTO;

public interface IExpensesService
{
    public List<ExpenseDto> GetExpenses(ExpensesFilterDto filter);

    public ExpenseDto CreateExpense(ChangeExpenseParamsDto changeParams);

    public ExpenseDto UpdateExpense(int expenseId, ChangeExpenseParamsDto changeParams);

    public void DeleteExpense(int expenseId);

    public List<ExtendedExpenseNameDto> SearchExpenseNames(string term, bool ignoreCategory);
}
