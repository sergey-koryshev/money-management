namespace Backend.Infrastructure;

using Backend.Domain.Entities;
using Backend.Infrastructure.Converters;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Models = Backend.Domain.Models;

public class AppDbContext : IdentityUserContext<User, int>
{
    public virtual DbSet<Person> Persons { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Currency> Currencies { get; set; }

    public virtual DbSet<CurrencyMapping> CurrencyMappings { get; set; }

    public virtual DbSet<Connection> Connections { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<AnnouncementType> AnnouncementTypes { get; set; }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public AppDbContext() {}

    public AppDbContext(DbContextOptions<AppDbContext> options): base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("pg_trgm");
        modelBuilder.HasPostgresExtension("unaccent");

        modelBuilder.Entity<Category>()
            .HasMany(s => s.PermittedPersons)
            .WithMany(c => c.Categories)
            .UsingEntity(
                "CategoriesToPerson",
                r => r.HasOne(typeof(Person)).WithMany().HasForeignKey("PersonId").HasPrincipalKey(nameof(Person.Id)),
                l => l.HasOne(typeof(Category)).WithMany().HasForeignKey("CategoryId").HasPrincipalKey(nameof(Category.Id)),
                j => j.HasKey("CategoryId", "PersonId"));

        modelBuilder.Entity<Expense>()
            .HasMany(s => s.PermittedPersons)
            .WithMany(c => c.Expenses)
            .UsingEntity(
                "ExpensesToPerson",
                r => r.HasOne(typeof(Person)).WithMany().HasForeignKey("PersonId").HasPrincipalKey(nameof(Person.Id)),
                l => l.HasOne(typeof(Expense)).WithMany().HasForeignKey("ExpenseId").HasPrincipalKey(nameof(Expense.Id)),
                j => j.HasKey("ExpenseId", "PersonId"));
        
        modelBuilder.Entity<Announcement>()
            .HasIndex(e => new { e.TypeId, e.Active })
            .IsUnique()
            // PostgreSQL specific code below
            .HasFilter($"\"{nameof(Announcement.Active)}\" = TRUE");

        modelBuilder.Entity<Announcement>()
            .HasMany(s => s.DismissedFor)
            .WithMany(c => c.DismissedAnnouncements)
            .UsingEntity(
                "DismissedAnnouncements",
                r => r.HasOne(typeof(Person)).WithMany().HasForeignKey("PersonId").HasPrincipalKey(nameof(Person.Id)),
                l => l.HasOne(typeof(Announcement)).WithMany().HasForeignKey("AnnouncementId").HasPrincipalKey(nameof(Announcement.Id)),
                j => j.HasKey("AnnouncementId", "PersonId"));

        modelBuilder.Entity<AnnouncementType>()
            .HasData(Enum.GetValues(typeof(Models.AnnouncementType))
                .Cast<Models.AnnouncementType>()
                .Select(e => new AnnouncementType()
                {
                    Id = (int)e,
                    Name = e.ToString()
                }));
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Properties<DateTime>().HaveConversion<DateTimeUtcConverter>();
        configurationBuilder.Properties<DateTime?>().HaveConversion<NullableDateTimeUtcConverter>();
    }
}