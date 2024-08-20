namespace Backend.WebApi;

using Backend.Domain.DTO;
using Backend.Service;
using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class ExpensesController
{
    private readonly IExpensesService expensesService;

    public ExpensesController(IExpensesService expensesService)
    {
        this.expensesService = expensesService;
    }

    [HttpGet]
    public IActionResult GetExpenses(int month, int year)
    {
        var result = this.expensesService.GetExpenses(new ExpensesFilterDto
        {
            Month = month,
            Year = year
        });
        return new AppActionResult(result);
    }

    [HttpPost]
    public IActionResult CreateExpense([FromBody] ChangeExpenseParamsDto changeParams)
    {
        var result = this.expensesService.CreateExpense(changeParams);
        return new AppActionResult(result);
    }

    [HttpGet]
    [Route("search/expenseNames")]
    public IActionResult SearchExpenseNames(string term)
    {
        var result = this.expensesService.SearchExpenseNames(term);
        return new AppActionResult(result);
    }

}
