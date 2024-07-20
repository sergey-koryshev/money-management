namespace Backend.Domain.Entities;

using System.ComponentModel.DataAnnotations;

public class Person
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public required string FirstName { get; set; }

    [Required]
    public required string SecondName { get; set; }

    [Required]
    public Guid Tenant { get; set; }

    public virtual ICollection<Category> CreatedCategories { get; set; } = new List<Category>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<CurrencyMapping> CurrencyMappings { get; set; } = new List<CurrencyMapping>();
}
