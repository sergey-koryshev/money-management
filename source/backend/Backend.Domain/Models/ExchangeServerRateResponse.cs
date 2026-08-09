namespace Backend.Domain.Models;

using System.Text.Json.Serialization;

public class ExchangeServerRateResponse
{
    [JsonPropertyName("rates")]
    public required Dictionary<DateTime, Dictionary<string, double>> Rates { get; set; }
}
