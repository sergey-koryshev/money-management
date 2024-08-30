namespace Backend.Infrastructure;

using Backend.Domain.Entities;
using Backend.Infrastructure.Converters;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityUserContext<User, int>
{
    public virtual DbSet<Person> Persons { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Currency> Currencies { get; set; }

    public virtual DbSet<CurrencyMapping> CurrencyMappings { get; set; }

    public virtual DbSet<Connection> Connections { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

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
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Properties<DateTime>().HaveConversion<DateTimeUtcConverter>();
    }
}