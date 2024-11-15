namespace Backend.Domain.Models;

public class ExchangeServerResponseRoot
{
    public required Dictionary<DateTime, Dictionary<string, double>> rates { get; set; }
}
