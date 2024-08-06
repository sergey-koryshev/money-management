namespace Backend.Domain.Models;

public class Price
{
    public double Amount { get; set; }

    public required Currency Currency { get; set; }
}
