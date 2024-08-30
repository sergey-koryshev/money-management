using System;

namespace Backend.Domain.Models;

public class ExtendedExpenseName
{
    public required string Name { get; set; }

    public string? CategoryName { get; set; }
}
