namespace Backend.Tests.Repositories;

using Backend.Application;
using FluentAssertions;
using Entities = Domain.Entities;

[TestFixture]
public class CurrenciesRepositoryTests : TestsBase
{
    private List<Entities.Currency> currencies;

    protected override bool ShouldCurrencyMappingsBeDeletedInTearDown => true;

    protected override bool ShouldCurrenciesBeDeletedInOneTimeTearDown => true;

    [TestCase(DanielTenant)]
    [TestCase(VeronikaTenant)]
    public void GetAllCurrencies_CurrencyMappingsExistForUsers_ReturnsAllCurrenciesForSpecifiedUser(string userTenant)
    {
        var currencyMappings = new List<Entities.CurrencyMapping>
        {
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[0].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[2].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[0].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[1].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[2].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            }
        };

        this.DbContext.AddRange(currencyMappings);
        this.DbContext.SaveChanges();

        var user = this.DbContext.Persons.First(p => p.Tenant.ToString() == userTenant);

        var result = new CurrenciesRepository(this.DbContext, user).GetAllCurrencies();

        var expectedCurrencies = currencyMappings.Where(m => m.PersonId == user.Id).Select(m => m.Currency!).ToList();
        result.Should().BeEquivalentTo(expectedCurrencies, p => p.Excluding(c => c.CurrencyMappings));
    }

    [Theory]
    public void GetMainCurrency_MainCurrencySetOrNot_ReturnsMainCurrencyOrNull(bool isMainCurrencySet)
    {
        var currencyMappings = new List<Entities.CurrencyMapping>
        {
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[0].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = isMainCurrencySet,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[1].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[2].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = true,
            }
        };

        this.DbContext.AddRange(currencyMappings);
        this.DbContext.SaveChanges();

        var result = new CurrenciesRepository(this.DbContext, this.Daniel).GetMainCurrency();
        result.Should().BeEquivalentTo(isMainCurrencySet ? this.currencies[0] : null, p => p.Excluding(c => c!.CurrencyMappings));
    }

    [Test]
    public void SetMainCurrency_NotAvailableCurrency_ErrorThrown()
    {
        var currencyMappings = new List<Entities.CurrencyMapping>
        {
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[0].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = true,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[1].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[2].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = true,
            }
        };

        this.DbContext.AddRange(currencyMappings);
        this.DbContext.SaveChanges();

        new Action(() => new CurrenciesRepository(this.DbContext, this.Daniel).SetMainCurrency(this.currencies[2].Id))
            .Should().Throw<InvalidOperationException>()
            .WithMessage($"Currency with Id '{this.currencies[2].Id}' is hidden or doesn't exist and cannot be set as main currency.");
        
    }

    [Theory]
    public void SetMainCurrency_NoConflicts_MainCurrencyIsSet(bool isSameCurrency)
    {
        var currencyMappings = new List<Entities.CurrencyMapping>
        {
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[0].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = true,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[1].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[2].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = true,
            }
        };

        this.DbContext.AddRange(currencyMappings);
        this.DbContext.SaveChanges();

        var result = new CurrenciesRepository(this.DbContext, this.Daniel).SetMainCurrency(isSameCurrency ? this.currencies[0].Id : this.currencies[1].Id);
        result.Should().BeEquivalentTo(isSameCurrency ? this.currencies[0] : this.currencies[1], p => p.Excluding(c => c.CurrencyMappings));
    }

    [Theory]
    public void DeleteMainCurrency_MainCurrencySetOrNot_MainCurrencyIsDeleted(bool isMainCurrencyAlreadySet)
    {
        var currencyMappings = new List<Entities.CurrencyMapping>
        {
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[0].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[1].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = isMainCurrencyAlreadySet,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = this.currencies[2].Id,
                PersonId = this.Veronika.Id,
                IsMainCurrency = true,
            }
        };

        this.DbContext.AddRange(currencyMappings);
        this.DbContext.SaveChanges();

        new CurrenciesRepository(this.DbContext, this.Daniel).DeleteMainCurrency();
        this.DbContext.CurrencyMappings.Find(currencyMappings[1].Id)!.IsMainCurrency.Should().BeFalse();
    }

    [OneTimeSetUp]
    public void SetUpTestFixture()
    {
        this.currencies = new List<Entities.Currency>
        {
            new Entities.Currency
            {
                Name = "C1",
                FriendlyName = "Currency 1",
                FlagCode = "FC1"
            },
            new Entities.Currency
            {
                Name = "C2",
                FriendlyName = "Currency 2",
                FlagCode = "FC2"
            },
            new Entities.Currency
            {
                Name = "C3",
                FriendlyName = "Currency 3",
                FlagCode = "FC3"
            }
        };

        this.DbContext.AddRange(currencies);
        this.DbContext.SaveChanges();
    }
}
