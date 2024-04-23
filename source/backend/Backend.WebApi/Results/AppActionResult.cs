namespace Backend.WebApi.Results;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class AppActionResult : IActionResult
{
    private readonly object? value;

    public AppActionResult() : this(null) { }

    public AppActionResult(object? value)
    {
        this.value = value;
    }

    public async Task ExecuteResultAsync(ActionContext context)
    {
        if (context.HttpContext.Response.StatusCode != 200 && value is string errorMessage)
        {
            var error = new AppError
            {
                StatusCode = context.HttpContext.Response.StatusCode,
                Message = errorMessage
            };

            await context.HttpContext.Response.WriteAsJsonAsync(error, typeof(AppError));
        }
        else if (context.HttpContext.Response.StatusCode == 200)
        {
            var result = new AppResult
            {
                StatusCode = context.HttpContext.Response.StatusCode,
                Data = value
            };

            await context.HttpContext.Response.WriteAsJsonAsync(result, typeof(AppResult));
        }
    }
}

