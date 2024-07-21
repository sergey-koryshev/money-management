namespace Backend.Domain.Entities;

using System.ComponentModel.DataAnnotations;

public class Currency
{
    public int Id { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public required string FriendlyName { get; set; }

    [Required]
    public required string FlagCode { get; set; }

    public string? Sign { get; set; }

    public virtual ICollection<CurrencyMapping> CurrencyMappings { get; set; } = new List<CurrencyMapping>();
}