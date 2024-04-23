namespace Backend.Domain.Models;

public class UserModel
{
    public required string Id { get; set; }

    public required string FirstName { get; set; }

    public string? SecondName { get; set; }
}