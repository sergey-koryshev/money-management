namespace Backend.Domain.Entities;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Category
{
    public int Id { get; set; }

    [Required]
    public string? Name { get; set; }

    [Required]
    public int CreatedById { get; set; }

    [InverseProperty(nameof(Person.CreatedCategories))]
    public virtual Person? CreatedBy { get; set; }

    [InverseProperty(nameof(Person.Categories))]
    public virtual ICollection<Person> PermittedPersons { get; set; } = new List<Person>();
}
