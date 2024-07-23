namespace Backend.Domain.Entities;

using System.ComponentModel.DataAnnotations;

public class Connection
{
    public int Id { get; set; }

    [Required]
    public int RequestingPersonId { get; set; }

    [Required]
    public int TargetPersonId { get; set; }

    [Required]
    public bool IsAccepted { get; set; }

    [Required]
    public DateTime RequestedOn { get; set; }

    public DateTime? AcceptedOn { get; set; }

    public virtual Person? RequestingPerson { get; set; }

    public virtual Person? TargetPerson { get; set; }
}
