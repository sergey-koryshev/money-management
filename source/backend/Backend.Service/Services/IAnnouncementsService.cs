namespace Backend.Service.Services;

using Backend.Domain.DTO;

public interface IAnnouncementsService
{
    public List<AnnouncementDto> GetActualAnnouncements();

    public void Dismiss(int announcementId);
}
