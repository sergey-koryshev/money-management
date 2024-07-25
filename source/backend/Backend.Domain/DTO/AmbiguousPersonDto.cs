namespace Backend.Domain.DTO;

public class AmbiguousPersonDto
{
    public int Id { get; set; }

    public string? FirstName { get; set; }

    public string? SecondName { get; set; }

    public Guid? Tenant { get; set; }
}
