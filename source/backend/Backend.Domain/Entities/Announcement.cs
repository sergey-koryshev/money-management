namespace Backend.Domain.Entities;

using System;
using System.ComponentModel.DataAnnotations;

public class Announcement
{
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets title for the announcements.
    /// </summary>
    /// <remarks>
    /// The title is used only for announcement with type <c>PopUp</c>.
    /// </remarks>
    public string? Title { get; set; }

    [Required]
    public required string HTML { get; set; }

    [Required]
    public DateTime TimeStamp { get; set; }

    [Required]
    public int TypeId { get; set; }

    /// <summary>
    /// Gets or sets flag indicating whether the announcement can be dismissed.
    /// </summary>
    /// <remarks>
    /// The property is taken into account only for announcement with type <c>Alert</c>.
    /// </remarks>
    public bool? Dismissible { get; set; }

    [Required]
    public bool Active { get; set; }

    public virtual AnnouncementType? Type { get; set; }

    public virtual ICollection<Person> DismissedFor { get; set; } = new List<Person>();
}
