namespace Backend.Domain.Models;

public class Connection
{
    public int Id { get; set; }

    public required Person RequestingPerson { get; set; }

    public required Person TargetPerson { get; set; }

    public bool IsAccepted { get; set; }

    public DateTime RequestedOn { get; set; }

    public DateTime? AcceptedOn { get; set; }
}
