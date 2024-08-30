namespace Backend.WebApi;

using Backend.Service;
using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class CategoriesController
{
    private readonly ICategoriesService categoryService;

    public CategoriesController(ICategoriesService categoriesService)
    {
        this.categoryService = categoriesService;
    }

    [HttpGet]
    [Route("uniqueNames")]
    public IActionResult GetUniqueCategoryNames()
    {
        var categories = this.categoryService.GetUniqueCategoryNames();
        return new AppActionResult(categories);
    }
}
