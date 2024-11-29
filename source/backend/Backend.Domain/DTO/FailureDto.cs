using Backend.Domain.Models;

namespace Backend.Domain.DTO;

public class FailureDto
{
    public required FailureType Type { get; set; }

    public required string Message { get; set; }
}
