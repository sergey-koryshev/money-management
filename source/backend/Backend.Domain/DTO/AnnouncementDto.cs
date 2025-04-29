namespace Backend.Domain.DTO;

using Backend.Domain.Models;

public class AnnouncementDto
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public required string HTML { get; set; }

    public AnnouncementType Type { get; set; }

    public bool? Dismissible { get; set; }
}
