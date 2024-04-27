namespace Backend.Domain.Models;

public class UserModel
{
    public required int Id { get; set; }

    public required string FirstName { get; set; }

    public string? SecondName { get; set; }

    public required Guid Tenant { get; set; }
}