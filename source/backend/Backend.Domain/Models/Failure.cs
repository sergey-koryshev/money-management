namespace Backend.Domain.Models;

public class Failure
{
    public required FailureType Type { get; set; }

    public required string Message { get; set; }
}
