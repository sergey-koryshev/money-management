namespace Backend.WebApi.Results;

public class AppResult
{
    public required int StatusCode { get; set; }

    public object? Data { get; set; }
}