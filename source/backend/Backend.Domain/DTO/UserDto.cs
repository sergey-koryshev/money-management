namespace Backend.Domain.DTO;

public class UserDto
{
    public required int Id { get; set; }

    public required string FirstName { get; set; }

    public required string SecondName { get; set; }

    public required Guid Tenant { get; set; }
}