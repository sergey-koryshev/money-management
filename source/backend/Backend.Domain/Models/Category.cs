namespace Backend.Domain.Models;

public class Category
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public Person? CreatedBy { get; set; }

    public List<Person> PermittedPersons { get; set; } = new List<Person>();
}
