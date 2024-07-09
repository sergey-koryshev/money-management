namespace Backend.Domain.DTO;

public class PersonDto
{
    public int Id { get; set; }

    public required string FirstName { get; set; }

    public required string SecondName { get; set; }

    public Guid Tenant { get; set; }
}