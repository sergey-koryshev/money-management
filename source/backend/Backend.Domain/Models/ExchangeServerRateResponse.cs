namespace Backend.Domain.Models;

using System.Text.Json.Serialization;

public class ExchangeServerRateResponse
{
    [JsonPropertyName("date")]
    public required DateTime Date { get; set; }

    [JsonPropertyName("base")]
    public required string Base { get; set; }

    [JsonPropertyName("quote")]
    public required string Quote { get; set; }

    [JsonPropertyName("rate")]
    public required double Rate { get; set; }
}
