namespace Backend.WebApi.Controllers;

using Backend.Domain.DTO;
using Backend.Service.Services;
using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;

[Route("[controller]")]
[ApiController]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementsService announcementsService;

    public AnnouncementsController(IAnnouncementsService announcementsService)
    {
        this.announcementsService = announcementsService;
    }

    [HttpGet]
    public IActionResult GetActualAnnouncements()
    {
        List<AnnouncementDto> result = this.announcementsService.GetActualAnnouncements();
        return new AppActionResult(result);
    }

    [HttpPost]
    [Route("{announcementId}/dismiss")]
    public IActionResult Dismiss(int announcementId)
    {
        this.announcementsService.Dismiss(announcementId);
        return new AppActionResult();
    }
}

