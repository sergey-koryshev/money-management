using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Domain.Entities;

public class Expense
{
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public required string Name { get; set; }

    public string? Description { get; set; }

    public int? CategoryId { get; set; }

    [Required]
    public double PriceAmount { get; set; }

    [Required]
    public int CurrencyId { get; set; }

    [Required]
    public int CreatedById { get; set; }

    public virtual Category? Category { get; set; }

    public virtual Currency? Currency { get; set; }

    [InverseProperty(nameof(Person.CreatedExpenses))]
    public virtual Person? CreatedBy { get; set; }

    [InverseProperty(nameof(Person.Expenses))]
    public virtual ICollection<Person> PermittedPersons { get; set; } = new List<Person>();
}
