namespace Backend.Tests.Repositories;

using Backend.Application.Repositories;
using Backend.Domain.Models;
using FluentAssertions;
using Entities = Domain.Entities;

[TestFixture]
public class AnnouncementsRepositoryTests : TestsBase
{
    protected override bool ShouldAnnouncementsBeDeletedInTearDown => true;

    [TestCase(DanielTenant, ExpectedResult = new string[] { "Announcement B" })]
    [TestCase(VeronikaTenant, ExpectedResult = new string[] { "Announcement B", "Announcement A" })]
    public string[] GetActualAnnouncements_ExistingAnnouncements_ShouldReturnActualAnnouncementListForSpecificUser(string userTenant)
    {
        var announcements = new List<Entities.Announcement>
        {
            new Entities.Announcement
            {
                TimeStamp = new DateTime(2025, 04, 15, 15, 1, 08).ToUniversalTime(),
                Title = "Announcement A",
                HTML = "<div>Announcement A</div>",
                TypeId = (int)AnnouncementType.Alert,
                Active = true,
                DismissedFor = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Announcement
            {
                TimeStamp = new DateTime(2025, 04, 17, 15, 1, 08).ToUniversalTime(),
                Title = "Announcement B",
                HTML = "<div>Announcement B</div>",
                TypeId = (int)AnnouncementType.PopUp,
                Active = true,
            },
            new Entities.Announcement
            {
                TimeStamp = new DateTime(2025, 04, 18, 15, 1, 08).ToUniversalTime(),
                Title = "Announcement C",
                HTML = "<div>Announcement C</div>",
                TypeId = (int)AnnouncementType.Alert,
                Active = false,
            },
            new Entities.Announcement
            {
                TimeStamp = new DateTime(2025, 04, 03, 15, 1, 08).ToUniversalTime(),
                Title = "Announcement D",
                HTML = "<div>Announcement D</div>",
                TypeId = (int)AnnouncementType.PopUp,
                Active = false,
            }
        };

        this.DbContext.AddRange(announcements);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        List<Announcement> result = new AnnouncementsRepository(this.DbContext, user!).GetActualAnnouncements();

        return result.Select((c) => c.Title!).ToArray();
    }

    [Test]
    public void Dismiss_NotActiveAnnouncement_NoExceptionThrown()
    {
        var announcement = new Entities.Announcement
        {
            TimeStamp = new DateTime(2025, 04, 15, 15, 1, 08).ToUniversalTime(),
            Title = "Announcement A",
            HTML = "<div>Announcement A</div>",
            TypeId = (int)AnnouncementType.Alert,
            Active = false
        };

        this.DbContext.Announcements.Add(announcement);
        this.DbContext.SaveChanges();

        var announcementsRepository = new AnnouncementsRepository(this.DbContext, this.Daniel);
        
        announcementsRepository.GetActualAnnouncements().Should().BeEmpty();
        announcementsRepository.Dismiss(announcement.Id);
        announcementsRepository.GetActualAnnouncements().Should().BeEmpty();
    }

    [Test]
    public void Dismiss_AlreadyDismissedAnnouncement_NoExceptionThrown()
    {
        this.DbContext.Attach(this.Daniel);

        var announcement = new Entities.Announcement
        {
            TimeStamp = new DateTime(2025, 04, 15, 15, 1, 08).ToUniversalTime(),
            Title = "Announcement A",
            HTML = "<div>Announcement A</div>",
            TypeId = (int)AnnouncementType.Alert,
            Active = true,
            DismissedFor = new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Announcements.Add(announcement);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var announcementsRepository = new AnnouncementsRepository(this.DbContext, this.Daniel);
        
        announcementsRepository.GetActualAnnouncements().Should().BeEmpty();
        announcementsRepository.Dismiss(announcement.Id);
        announcementsRepository.GetActualAnnouncements().Should().BeEmpty();
    }

    [Test]
    public void Dismiss_NonDismissibleAlert_ExceptionThrown()
    {
        var announcement = new Entities.Announcement
        {
            TimeStamp = new DateTime(2025, 04, 15, 15, 1, 08).ToUniversalTime(),
            Title = "Announcement A",
            HTML = "<div>Announcement A</div>",
            TypeId = (int)AnnouncementType.Alert,
            Active = true,
            Dismissible = false
        };

        this.DbContext.Announcements.Add(announcement);
        this.DbContext.SaveChanges();

        var announcementsRepository = new AnnouncementsRepository(this.DbContext, this.Daniel);
        
        announcementsRepository.GetActualAnnouncements().Should().HaveCount(1);
        new Action(() => announcementsRepository.Dismiss(announcement.Id)).Should()
            .Throw<InvalidOperationException>()
            .WithMessage("The alert cannot be dismissed.");
    }

    [Test]
    public void Dismiss_NonDismissibleNonAlert_AnnouncementDismissed()
    {
        var announcement = new Entities.Announcement
        {
            TimeStamp = new DateTime(2025, 04, 15, 15, 1, 08).ToUniversalTime(),
            Title = "Announcement A",
            HTML = "<div>Announcement A</div>",
            TypeId = (int)AnnouncementType.PopUp,
            Active = true,
            Dismissible = false
        };

        this.DbContext.Announcements.Add(announcement);
        this.DbContext.SaveChanges();

        var announcementsRepository = new AnnouncementsRepository(this.DbContext, this.Daniel);
        
        announcementsRepository.GetActualAnnouncements().Should().HaveCount(1);
        announcementsRepository.Dismiss(announcement.Id);
        announcementsRepository.GetActualAnnouncements().Should().HaveCount(0);
    }

    [TestCase(AnnouncementType.Alert)]
    [TestCase(AnnouncementType.PopUp)]
    public void Dismiss_DismissibleAnnouncement_AnnouncementDismissed(AnnouncementType type)
    {
        var announcement = new Entities.Announcement
        {
            TimeStamp = new DateTime(2025, 04, 15, 15, 1, 08).ToUniversalTime(),
            Title = "Announcement A",
            HTML = "<div>Announcement A</div>",
            TypeId = (int)type,
            Active = true,
            Dismissible = true
        };

        this.DbContext.Announcements.Add(announcement);
        this.DbContext.SaveChanges();

        var announcementsRepository = new AnnouncementsRepository(this.DbContext, this.Daniel);
        
        announcementsRepository.GetActualAnnouncements().Should().HaveCount(1);
        announcementsRepository.Dismiss(announcement.Id);
        announcementsRepository.GetActualAnnouncements().Should().HaveCount(0);
    }
}
