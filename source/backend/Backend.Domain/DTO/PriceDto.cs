namespace Backend.Domain.DTO;

public class PriceDto
{
    public double Amount { get; set; }

    public required CurrencyDto Currency { get; set; }

    public double? ExchangeRate { get; set; }

    public DateTime? ExchangeRateDate { get; set; }

    public FailureDto? ExchangeFailure { get; set; }
}
