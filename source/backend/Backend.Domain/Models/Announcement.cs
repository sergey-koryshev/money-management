namespace Backend.Domain.Models;

using System;

public class Announcement
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public required string HTML { get; set; }

    public DateTime TimeStamp { get; set; }

    public AnnouncementType Type { get; set; }

    public bool? Dismissible { get; set; }
}
