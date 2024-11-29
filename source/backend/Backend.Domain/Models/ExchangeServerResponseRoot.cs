namespace Backend.Domain.Models;

using System.Text.Json.Serialization;

public class ExchangeServerResponseRoot
{
    [JsonPropertyName("rates")]
    public required Dictionary<DateTime, Dictionary<string, double>> Rates { get; set; }
}
