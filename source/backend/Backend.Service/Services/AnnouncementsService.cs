namespace Backend.Service.Services;

using AutoMapper;
using Backend.Application.Repositories;
using Backend.Domain.DTO;
using Backend.Domain.Models;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

public class AnnouncementsService : ServiseBase, IAnnouncementsService
{
    public AnnouncementsService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory) : base(httpContextAccessor, mapper, dbContextFactory) {}
    
    public List<AnnouncementDto> GetActualAnnouncements()
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            List<Announcement> result = new AnnouncementsRepository(dbContext, this.Identity!).GetActualAnnouncements().ToList();
            return result.Select(c => this.Mapper.Map<AnnouncementDto>(c)).ToList();
        });
    }

    public void Dismiss(int announcementId)
    {
        this.ExecuteActionInTransaction((dbContext) =>
        {
            new AnnouncementsRepository(dbContext, this.Identity!).Dismiss(announcementId);
        });
    }
}
