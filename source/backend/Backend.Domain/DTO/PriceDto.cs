namespace Backend.Domain.DTO;

public class PriceDto
{
    public double Amount { get; set; }

    public required CurrencyDto Currency { get; set; }
}
