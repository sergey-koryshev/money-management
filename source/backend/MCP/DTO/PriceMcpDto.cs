namespace MCP.DTO;

using System.ComponentModel;

[Description("Represents a price of expense. May contain converted price into another currency.")]
public class PriceMcpDto
{
    [Description("The amount of the price.")]
    public double Amount { get; set; }

    [Description("The currency of the price.")]
    public required CurrencyMcpDto Currency { get; set; }

    [Description("The exchange rate for the price.")]
    public double? ExchangeRate { get; set; }

    [Description("The date of the exchange rate.")]
    public DateTime? ExchangeRateDate { get; set; }

    [Description("The failure that occurred during exchange rate retrieval.")]
    public FailureMcpDto? ExchangeFailure { get; set; }
}