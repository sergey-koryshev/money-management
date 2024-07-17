namespace Backend.Tests;

using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

public abstract class TestsBase
{
    protected AppDbContext DbContext { get; }

    protected Person Daniel { get; }

    protected Person Veronika { get; }

    protected TestsBase()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Tests.json")
            .Build();
            
        var builder = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(config.GetConnectionString("Postgres"));

        this.DbContext = new AppDbContext(builder.Options);

        this.Daniel = new Person
        {
            FirstName = "Daniel",
            SecondName = "Moriarty",
            Tenant = Guid.NewGuid()
        };

        this.Veronika = new Person
        {
            FirstName = "Veronika",
            SecondName = "Payne",
            Tenant = Guid.NewGuid()
        };
    }

    [OneTimeSetUp]
    protected void TestsBaseSetup()
    {
        this.DbContext.Persons.Add(this.Daniel);
        this.DbContext.Persons.Add(this.Veronika);

        this.DbContext.SaveChanges();
    }

    [OneTimeTearDown]
    protected void TestsBaseTearDown()
    {
        this.DbContext.Persons.Remove(this.Daniel);
        this.DbContext.Persons.Remove(this.Veronika);

        this.DbContext.SaveChanges();
        this.DbContext.Dispose();
    }
}
