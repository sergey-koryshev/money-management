namespace MCP.DTO;

using System.ComponentModel;

[Description("Represents a currency used to describe prices.")]
public class CurrencyMcpDto
{
    [Description("The unique identifier of the currency.")]
    public int Id { get; set; }

    [Description("The full name of the currency.")]
    public required string Name { get; set; }
}
