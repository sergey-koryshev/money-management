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
    public IActionResult GetAllCurrencies(int month, int year)
    {
        var categories = this.expensesService.GetExpenses(new ExpensesFilterDto
        {
            Month = month,
            Year = year
        });
        return new AppActionResult(categories);
    }
}
