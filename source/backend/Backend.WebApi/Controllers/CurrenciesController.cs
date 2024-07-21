namespace Backend.WebApi;

using Backend.Service;
using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class CurrenciesController
{
    private readonly ICurrenciesService currenciesService;

    public CurrenciesController(ICurrenciesService currenciesService)
    {
        this.currenciesService = currenciesService;
    }

    [HttpGet]
    public IActionResult GetAllCurrencies()
    {
        var categories = this.currenciesService.GetAllCurrencies();
        return new AppActionResult(categories);
    }

    [HttpGet]
    [Route("main")]
    public IActionResult GetMainCurrency()
    {
        var category = this.currenciesService.GetMainCurrency();
        return new AppActionResult(category);
    }

    [HttpPost]
    [Route("main")]
    public IActionResult SetMainCurrency([FromBody] int currencyId)
    {
        var category = this.currenciesService.SetMainCurrency(currencyId);
        return new AppActionResult(category);
    }

    [HttpDelete]
    [Route("main")]
    public IActionResult RemoveMainCurrency()
    {
        this.currenciesService.DeleteMainCurrency();
        return new AppActionResult();
    }
}
