namespace Backend.Domain.Models;

public class Expense
{
    public int Id { get; set; }

    public DateTime CreatedOn { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required Category Category { get; set; }

    public required Price Price { get; set; }

    public Price? OriginalPrice { get; set; }

    public required Person CreatedBy { get; set; }

    public List<Person> PermittedPersons { get; set; } = new List<Person>();
}
