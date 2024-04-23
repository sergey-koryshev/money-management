namespace Backend.WebApi.Filters;

using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class ExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var error = new AppError
        {
            StatusCode = 500,
            Message = context.Exception.Message
        };

        context.Result = new ObjectResult(error) { StatusCode = 500 };
    }
}