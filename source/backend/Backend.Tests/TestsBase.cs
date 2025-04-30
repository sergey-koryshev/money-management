namespace Backend.Tests;

using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

public abstract class TestsBase
{
    protected const string DanielTenant = "1648284a-e4e2-43ad-8594-bcacc4bfef46";
    
    protected const string VeronikaTenant = "dda338a5-98b7-4975-bc41-f94ddac58e23";

    protected const string ChuckTenant = "e8df1978-77ca-4cd8-8db6-c1058f2ba359";

    private readonly DbContextOptionsBuilder<AppDbContext> dbContextOptionsBuilder;

    private int lastCurrencyMappingId;

    private int lastCurrencyId;

    private int lastConnectionId;

    private int lastPersonId;

    private int lastCategoryId;

    private int lastExpenseId;

    private int lastAnnouncementId;

    protected AppDbContext DbContext { get; }

    protected Person Daniel { get; }

    protected Person Veronika { get; }

    protected Person Chuck { get; }

    protected virtual bool ShouldCurrencyMappingsBeDeletedInTearDown => false;

    protected virtual bool ShouldCurrencyMappingsBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldCurrenciesBeDeletedInTearDown => false;

    protected virtual bool ShouldCurrenciesBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldConnectionsBeDeletedInTearDown => false;

    protected virtual bool ShouldConnectionsBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldPersonsBeDeletedInTearDown => false;

    protected virtual bool ShouldPersonsBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldCategoriesBeDeletedInTearDown => false;

    protected virtual bool ShouldCategoriesBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldExpensesBeDeletedInTearDown => false;

    protected virtual bool ShouldExpensesBeDeletedInOneTimeTearDown => false;

    protected virtual bool ShouldAnnouncementsBeDeletedInTearDown => false;

    protected virtual bool ShouldAnnouncementsBeDeletedInOneTimeTearDown => false;

    protected TestsBase()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("settings.json")
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

        this.Chuck = new Person
        {
            FirstName = "Chuck",
            SecondName = "Norris",
            Tenant = new Guid(ChuckTenant)
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

        if (this.ShouldCategoriesBeDeletedInTearDown || this.ShouldCategoriesBeDeletedInOneTimeTearDown)
        {
            this.lastCategoryId = this.DbContext.Categories.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        if (this.ShouldExpensesBeDeletedInTearDown || this.ShouldExpensesBeDeletedInOneTimeTearDown)
        {
            this.lastExpenseId = this.DbContext.Expenses.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        if (this.ShouldAnnouncementsBeDeletedInTearDown || this.ShouldAnnouncementsBeDeletedInOneTimeTearDown)
        {
            this.lastAnnouncementId = this.DbContext.Announcements.Select(e => e.Id).OrderByDescending(e => e).FirstOrDefault();
        }

        this.DbContext.Persons.Add(this.Daniel);
        this.DbContext.Persons.Add(this.Veronika);
        this.DbContext.Persons.Add(this.Chuck);

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

        if (this.ShouldCategoriesBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.Categories.Where(c => c.Id > this.lastCategoryId))
            {
                this.DbContext.Categories.Remove(entity);
            }
        }

        if (this.ShouldExpensesBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.Expenses.Where(c => c.Id > this.lastExpenseId))
            {
                this.DbContext.Expenses.Remove(entity);
            }
        }

        if (this.ShouldAnnouncementsBeDeletedInOneTimeTearDown)
        {
            foreach (var entity in this.DbContext.Announcements.Where(c => c.Id > this.lastAnnouncementId))
            {
                this.DbContext.Announcements.Remove(entity);
            }
        }

        var usersTenantsToDelete = new List<string> { DanielTenant, VeronikaTenant, ChuckTenant };

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

        if (this.ShouldCategoriesBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.Categories.Where(c => c.Id > this.lastCategoryId))
            {
                this.DbContext.Categories.Remove(entity);
            }
        }

        if (this.ShouldExpensesBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.Expenses.Where(c => c.Id > this.lastExpenseId))
            {
                this.DbContext.Expenses.Remove(entity);
            }
        }

        if (this.ShouldAnnouncementsBeDeletedInTearDown)
        {
            foreach (var entity in this.DbContext.Announcements.Where(c => c.Id > this.lastAnnouncementId))
            {
                this.DbContext.Announcements.Remove(entity);
            }
        }

        this.DbContext.SaveChanges();
    }

    [SetUp]
    protected void TestBaseSetUp()
    {
        // to make DbContext behave more like in production, we need to clear change tracker
        // to prevent having cached entities in navigation properties automatically
        this.ClearChangeTracker();
    }

    protected void ClearChangeTracker()
    {
        this.DbContext?.ChangeTracker.Clear();

        // we need to keep users attached to DB context to have actual state of navigation properties
        this.DbContext?.Attach(this.Daniel);
        this.DbContext?.Attach(this.Veronika);
        this.DbContext?.Attach(this.Chuck);
    }

    protected AppDbContext GetDbContext() => new AppDbContext(this.dbContextOptionsBuilder.Options);
}
