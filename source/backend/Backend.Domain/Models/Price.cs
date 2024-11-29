namespace Backend.Domain.Models;

public class Price
{
    public double Amount { get; set; }

    public required Currency Currency { get; set; }

    public double? ExchangeRate { get; set; }

    public DateTime? ExchangeRateDate { get; set; }

    public Failure? ExchangeFailure { get; set; }
}
