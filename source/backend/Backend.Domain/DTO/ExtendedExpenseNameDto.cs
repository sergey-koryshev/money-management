using System;

namespace Backend.Domain.DTO;

public class ExtendedExpenseNameDto
{
    public required string Name { get; set; }

    public string? CategoryName { get; set; }
}
