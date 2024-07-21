namespace Backend.Domain.DTO;

public class CurrencyDto
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string FriendlyName { get; set; }

    public required string FlagCode { get; set; }

    public string? Sign { get; set; }
}
