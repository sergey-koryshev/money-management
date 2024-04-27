namespace Backend.WebApi.Filters;

using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class ExceptionFilter : IExceptionFilter
{
    private readonly IHostEnvironment hostEnvironment;

    public ExceptionFilter(IHostEnvironment hostEnvironment) => this.hostEnvironment = hostEnvironment;

    public void OnException(ExceptionContext context)
    {
        var error = new AppError
        {
            StatusCode = 500,
            Message = this.hostEnvironment.IsProduction() ? "Server internal error" : context.Exception.Message,
            StackTrace = this.hostEnvironment.IsProduction() ? null : context.Exception.StackTrace
        };

        context.Result = new ObjectResult(error) { StatusCode = 500 };
    }
}