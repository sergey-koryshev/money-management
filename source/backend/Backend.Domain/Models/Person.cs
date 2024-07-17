namespace Backend.Domain.Models;

public class Person
{
    public int Id { get; set; }

    public required string FirstName { get; set; }

    public required string SecondName { get; set; }

    public required Guid Tenant { get; set; }
}
