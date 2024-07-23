namespace Backend.Domain.Models;

public class Connection
{
    public int Id { get; set; }

    public required AmbiguousPerson Person { get; set; }

    public ConnectionStatus Status { get; set; }
}
