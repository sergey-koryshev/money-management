namespace Backend.Domain.DTO;

public class ConnectionDto
{
    public int Id { get; set; }

    public ConnectionStatus Status { get; set; }

    public required AmbiguousPersonDto Person { get; set; }
}
