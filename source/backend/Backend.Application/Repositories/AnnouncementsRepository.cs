namespace Backend.Application.Repositories;

using Backend.Domain.Extensions;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using Backend.Infrastructure;
using Entities = Domain.Entities;

public class AnnouncementsRepository
{
    private readonly AppDbContext dbContext;

    private readonly Entities.Person identity;

    public AnnouncementsRepository(AppDbContext dbContext, Entities.Person identity)
    {
        this.dbContext = dbContext;
        this.identity = identity;
    }

    public List<Announcement> GetActualAnnouncements()
    {
        return this.GetAnnouncementsQuery()
            .AsEnumerable()
            .GroupBy(a => a.TypeId)
            .SelectMany(a => a.Take(1))
            .Select(a => a.ToModel()).ToList();
    }

    public void Dismiss(int announcementId)
    {
        var announcementEntity = this.GetAnnouncementsQuery().FirstOrDefault(a => a.Id == announcementId);

        if (announcementEntity != null)
        {
            if (announcementEntity.Dismissible == false && announcementEntity.TypeId == (int)AnnouncementType.Alert)
            {
                throw new InvalidOperationException("The alert cannot be dismissed.");
            }

            announcementEntity.DismissedFor.Add(this.identity);
            this.dbContext.SaveChanges();
        }
    }

    private IQueryable<Entities.Announcement> GetAnnouncementsQuery() {
        return this.dbContext.Announcements
            .OrderByDescending(a => a.TimeStamp)
            .Where(a => a.Active)
            .Where(a => !a.DismissedFor.Any(p => p.Id == this.identity.Id));
    }
}
