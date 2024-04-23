namespace Backend.WebApi.Results;

public class AppError
{
    public int? StatusCode { get; set; }

    public required string Message { get; set; }
}