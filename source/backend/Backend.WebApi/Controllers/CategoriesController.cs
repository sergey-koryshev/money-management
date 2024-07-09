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
    public IActionResult GetAllCategories()
    {
        var categories = this.categoryService.GetAllCategories();
        return new AppActionResult(categories);
    }
}
