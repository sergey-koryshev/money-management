﻿namespace Backend.WebApi;

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
    public IActionResult GetExpenses([FromQuery] ExpensesFilterDto filter)
    {
        var result = this.expensesService.GetExpenses(filter);
        return new AppActionResult(result);
    }

    [HttpPost]
    public IActionResult CreateExpense([FromBody] ChangeExpenseParamsDto changeParams)
    {
        var result = this.expensesService.CreateExpense(changeParams);
        return new AppActionResult(result);
    }

    [HttpPut]
    [Route("{expenseId}")]
    public IActionResult UpdateExpense(int expenseId, [FromBody] ChangeExpenseParamsDto changeParams)
    {
        var result = this.expensesService.UpdateExpense(expenseId, changeParams);
        return new AppActionResult(result);
    }

    [HttpDelete]
    [Route("{expenseId}")]
    public IActionResult DeleteExpense(int expenseId)
    {
        this.expensesService.DeleteExpense(expenseId);
        return new AppActionResult();
    }

    [HttpGet]
    [Route("search/expenseNames")]
    public IActionResult SearchExpenseNames(string term)
    {
        var result = this.expensesService.SearchExpenseNames(term);
        return new AppActionResult(result);
    }

    [HttpGet]
    [Route("search")]
    public IActionResult SearchExpenses(string searchingTerm, string timeZone)
    {
        var result = this.expensesService.GetExpenses(new ExpensesFilterDto
        {
            SearchingTerm = searchingTerm,
            TimeZone = timeZone
        });
        return new AppActionResult(result);
    }
}
