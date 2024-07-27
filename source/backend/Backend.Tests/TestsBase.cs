namespace Backend.Tests;

using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

public abstract class TestsBase
{
    protected const string DanielTenant = "1648284a-e4e2-43ad-8594-bcacc4bfef46";
    
    protected const string VeronikaTenant = "dda338a5-98b7-4975-bc41-f94ddac58e23";

    private readonly DbContextOptionsBuilder<AppDbContext> dbContextOptionsBuilder;

    private int lastCurrencyMappingId;

    private int lastCurrencyId;

    private int lastConnectionId;

    private int lastPersonId;

    protected AppDbContext DbContext { get; }

    protected Person Daniel { get; }

    protected Person Veronika { get; }

    protected virtual bool ShouldCurrencyMappingsBeDeletedInTearDown => false;

    protected virtual bool ShouldCurrencyMappingsBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldCurrenciesBeDeletedInTearDown => false;

    protected virtual bool ShouldCurrenciesBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldConnectionsBeDeletedInTearDown => false;

    protected virtual bool ShouldConnectionsBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldPersonsBeDeletedInTearDown => false;

    protected virtual bool ShouldPersonsBeDeletedInOneTimeTearDown => false;

    protected TestsBase()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Tests.json")
            .Build();
            
        this.dbContextOptionsBuilder = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(config.GetConnectionString("Postgres"));

        this.DbContext = this.GetDbContext();

        this.Daniel = new Person
        {
            FirstName = "Daniel",
            SecondName = "Moriarty",
            Tenant = new Guid(DanielTenant)
        };

        this.Veronika = new Person
        {
            FirstName = "Veronika",
            SecondName = "Payne",
            Tenant = new Guid(VeronikaTenant)
        };
    }

    [OneTimeSetUp]
    protected void TestsBaseSetup()
    {
        if (this.ShouldCurrencyMappingsBeDeletedInTearDown || this.ShouldCurrencyMappingsBeDeletedInOneTimeTearDown)
        {
            this.lastCurrencyMappingId = this.DbContext.CurrencyMappings.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        if (this.ShouldCurrenciesBeDeletedInTearDown || this.ShouldCurrenciesBeDeletedInOneTimeTearDown)
        {
            this.lastCurrencyId = this.DbContext.Currencies.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        if (this.ShouldConnectionsBeDeletedInTearDown || this.ShouldConnectionsBeDeletedInOneTimeTearDown)
        {
            this.lastConnectionId = this.DbContext.Connections.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        if (this.ShouldPersonsBeDeletedInTearDown || this.ShouldPersonsBeDeletedInOneTimeTearDown)
        {
            this.lastPersonId = this.DbContext.Persons.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        this.DbContext.Persons.Add(this.Daniel);
        this.DbContext.Persons.Add(this.Veronika);

        this.DbContext.SaveChanges();
    }

    [OneTimeTearDown]
    protected void TestsBaseOneTimeTearDown()
    {
        if (this.ShouldCurrencyMappingsBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.CurrencyMappings.Where(c => c.Id > this.lastCurrencyMappingId))
            {
                this.DbContext.CurrencyMappings.Remove(entity);
            }
        }

        if (this.ShouldCurrenciesBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.Currencies.Where(c => c.Id > this.lastCurrencyId))
            {
                this.DbContext.Currencies.Remove(entity);
            }
        }

        if (this.ShouldConnectionsBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.Connections.Where(c => c.Id > this.lastConnectionId))
            {
                this.DbContext.Connections.Remove(entity);
            }
        }

        if (this.ShouldPersonsBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.Persons.Where(c => c.Id > this.lastPersonId))
            {
                this.DbContext.Persons.Remove(entity);
            }
        }

        var usersTenantsToDelete = new List<string> { DanielTenant, VeronikaTenant };
        
        foreach (var entity in this.DbContext.Persons.Where(p => usersTenantsToDelete.Contains(p.Tenant.ToString())))
        {
            this.DbContext.Persons.Remove(entity);
        }

        this.DbContext.SaveChanges();
        this.DbContext.Dispose();
    }

    [TearDown]
    protected void TestsBaseTearDown()
    {
        if (this.ShouldCurrencyMappingsBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.CurrencyMappings.Where(c => c.Id > this.lastCurrencyMappingId))
            {
                this.DbContext.CurrencyMappings.Remove(entity);
            }
        }

        if (this.ShouldCurrenciesBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.Currencies.Where(c => c.Id > this.lastCurrencyId))
            {
                this.DbContext.Currencies.Remove(entity);
            }
        }

        if (this.ShouldConnectionsBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.Connections.Where(c => c.Id > this.lastConnectionId))
            {
                this.DbContext.Connections.Remove(entity);
            }
        }

        if (this.ShouldPersonsBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.Persons.Where(c => c.Id > this.lastPersonId))
            {
                this.DbContext.Persons.Remove(entity);
            }
        }

        this.DbContext.SaveChanges();
    }

    [SetUp]
    protected void TestBaseSetUp()
    {
        this.InvalidateDbContext();
    }

    protected void InvalidateDbContext() => this.DbContext?.ChangeTracker.Clear();

    protected AppDbContext GetDbContext() => new AppDbContext(this.dbContextOptionsBuilder.Options);
}
