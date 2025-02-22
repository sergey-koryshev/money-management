namespace Backend.Tests.Repositories;

using Backend.Application;
using Backend.Application.Clients;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Entities = Domain.Entities;

[TestFixture]
public class ExpensesRepositoryTests : TestsBase
{
    private List<Category> Categories { get; set; }

    private List<Currency> Currencies { get; set; }

    protected override bool ShouldCategoriesBeDeletedInTearDown => true;

    protected override bool ShouldExpensesBeDeletedInTearDown => true;

    protected override bool ShouldCurrenciesBeDeletedInOneTimeTearDown => true;

    protected override bool ShouldConnectionsBeDeletedInTearDown => true;

    protected override bool ShouldCurrencyMappingsBeDeletedInOneTimeTearDown => true;

    public Mock<IExchangeServerClient>? ExchangeServerClientMock { get; private set; }

    [TestCase(DanielTenant, ExpectedResult = new [] { "Expense A", "Expense B" })]
    [TestCase(VeronikaTenant, ExpectedResult = new [] { "Expense B", "Expense C", "Expense D" })]
    public string[] GetExpenses_ExpensesExistForDifferentUsers_UserCanSeeOnlyCreatedOrSharedExpenses(string userTenant)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense D",
                CategoryId = this.Categories[2].Id,
                PriceAmount = 36.6,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        var result = new ExpensesRepository(DbContext, user!).GetExpenses();

        return result.Select(e => e.Name).ToArray();
    }

    [TestCase("Australia/Sydney", ExpectedResult = new [] { "Expense A", "Expense D" })]
    [TestCase("UTC", ExpectedResult = new [] { "Expense A", "Expense D" })]
    [TestCase("America/Los_Angeles", ExpectedResult = new [] { "Expense D" })]
    public string[] GetExpenses_FilterByYearAndMonthAndTimeZone_ExpensesForSpecifiedYearAndMonthReturned(string timeZone)
    {
        this.DbContext.Attach(this.Daniel);

        var creatorTimeZone = TimeZoneInfo.FindSystemTimeZoneById("UTC");

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 8, 1), creatorTimeZone),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 06, 13), creatorTimeZone),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 07, 29), creatorTimeZone),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 8, 20), creatorTimeZone),
                Name = "Expense D",
                CategoryId = this.Categories[2].Id,
                PriceAmount = 36.6,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Daniel).GetExpenses(new ExpensesFilter
        {
            Year = 2024,
            Month = 8,
            TimeZone = timeZone
        });

        return result.Select(e => e.Name).ToArray();
    }

    [TestCase(null, null, null)]
    [TestCase(2024, null, null)]
    [TestCase(null, 8, null)]
    [TestCase(null, null, "UTC")]
    [TestCase(2024, 8, null)]
    [TestCase(2024, null, "UTC")]
    [TestCase(null, 8, "UTC")]
    public void GetExpenses_FilterWithMissingYearOrMonth_AllExpensesReturned(int? year, int? month, string? timeZone)
    {
        this.DbContext.Attach(this.Daniel);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 1).ToUniversalTime(),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Daniel).GetExpenses(new ExpensesFilter
        {
            Year = year,
            Month = month,
            TimeZone = timeZone
        });

        result.Select(e => e.Name).Should().BeEquivalentTo(new [] { "Expense A", "Expense B" });
    }

    [TestCase("wolt", ExpectedResult = new [] { "Wolt" })]
    [TestCase("store", ExpectedResult = new [] { "Apple Store", "Cookies Factory" })]
    [TestCase("ćevapi", ExpectedResult = new [] { "Ćevapi TOGO" })]
    [TestCase("konzum", ExpectedResult = new string[] {})]
    public string[] GetExpenses_FilterWithSearchingTerm_AllExpensesWithSpecifiedTermInNameOrDescriptionReturned(string term)
    {
        this.DbContext.Attach(this.Daniel);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 1).ToUniversalTime(),
                Name = "Wolt",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 42,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Apple Store",
                PriceAmount = 1108,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Cookies Factory",
                Description = "Very nice cookies store",
                PriceAmount = 73,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Ćevapi TOGO",
                PriceAmount = 73,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Daniel).GetExpenses(new ExpensesFilter
        {
            SearchingTerm = term
        });

        return result.Select(e => e.Name).ToArray();
    }

    [TestCase(null, ExpectedResult = new [] { "Expense B", "Expense C" })]
    [TestCase(0, ExpectedResult = new [] { "Expense C" })]
    [TestCase(-1, ExpectedResult = new [] { "Expense B" })]
    public string[] GetExpenses_FilterCreatedBy_CorrectedResultReturned(int? createdByFilterOption)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense D",
                CategoryId = this.Categories[2].Id,
                PriceAmount = 36.6,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Chuck.Id,
                PermittedPersons = new List<Entities.Person> { this.Chuck }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Veronika).GetExpenses(new ExpensesFilter
        {
            CreatedById = createdByFilterOption
        });

        return result.Select(e => e.Name).ToArray();
    }

    [TestCase(null, ExpectedResult = new [] { "Expense B", "Expense C" })]
    [TestCase(true, ExpectedResult = new [] { "Expense B" })]
    [TestCase(false, ExpectedResult = new [] { "Expense C" })]
    public string[] GetExpenses_FilterShared_CorrectedResultReturned(bool? sharedFilterOption)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense D",
                CategoryId = this.Categories[2].Id,
                PriceAmount = 36.6,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Chuck.Id,
                PermittedPersons = new List<Entities.Person> { this.Chuck }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Veronika).GetExpenses(new ExpensesFilter
        {
            Shared = sharedFilterOption
        });

        return result.Select(e => e.Name).ToArray();
    }

    [TestCase("Category 1", "Category 2", null, ExpectedResult = new[] { "Expense A", "Expense B", "Expense C", "Expense E" })]
    [TestCase("Category 2", ExpectedResult = new[] { "Expense C" })]
    [TestCase("Category 2", "Category 3", ExpectedResult = new[] { "Expense C" })]
    [TestCase("Category 3", ExpectedResult = new string[] {})]
    [TestCase(null, ExpectedResult = new string[] { "Expense B", "Expense E" })]
    public string[] GetExpenses_FilterCategoryNames_CorrectedResultReturned(params string?[] categoryNames)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense D",
                CategoryId = this.Categories[2].Id,
                PriceAmount = 36.6,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Chuck.Id,
                PermittedPersons = new List<Entities.Person> { this.Chuck }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
                Name = "Expense E",
                PriceAmount = 999,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Veronika).GetExpenses(new ExpensesFilter
        {
            CategoryName = new List<string?>(categoryNames)
        });

        return result.Select(e => e.Name).ToArray();
    }

    [TestCase("USD")]
    [TestCase("EUR")]
    [TestCase("XXX")]
    public void GetExpenses_MainCurrencySet_ExpensesHaveExchangedPrices(string currencyName)
    {
        this.DbContext.Attach(this.Daniel);

        var cetTimeZone = TimeZoneInfo.FindSystemTimeZoneById("CET");

        var exchangeRates = new Dictionary<DateTime, Dictionary<string, double>>();

        if (currencyName == "USD")
        {
            exchangeRates.Add(TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 22), cetTimeZone), new Dictionary<string, double>
            {
                ["EUR"] = 0.85985
            });
            exchangeRates.Add(TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 26), cetTimeZone), new Dictionary<string, double>
            {
                ["EUR"] = 0.86073
            });
        }
        else if (currencyName == "EUR")
        {
            exchangeRates.Add(TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 22), cetTimeZone), new Dictionary<string, double>
            {
                ["USD"] = 1.163
            });
        }

        this.ExchangeServerClientMock?
            .Setup(x => x.GetExchangeRates(
                It.IsAny<DateTime>(),
                It.IsAny<DateTime>(),
                It.IsAny<string>()))
            .Returns(exchangeRates);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 23), cetTimeZone),
                Name = "Expense A",
                PriceAmount = 51,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 24), cetTimeZone),
                Name = "Expense B",
                PriceAmount = 108,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 25), cetTimeZone),
                Name = "Expense C",
                PriceAmount = 199.99,
                CurrencyId = this.Currencies[2].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 26), cetTimeZone),
                Name = "Expense D",
                PriceAmount = 199.99,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var currency = this.Currencies.First(c => c.Name == currencyName);
        new CurrenciesRepository(this.DbContext, this.Daniel).SetMainCurrency(currency.Id);

        var result = new ExpensesRepository(DbContext, this.Daniel, this.ExchangeServerClientMock?.Object).GetExpenses();

        var expectedPrices = new List<ExpensePricePart>();

        if (currencyName == "USD")
        {
            expectedPrices = new List<ExpensePricePart>
            {
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[0].CurrencyId),
                        Amount = expenses[0].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = currency,
                        Amount = expenses[1].PriceAmount / 0.85985,
                        ExchangeRate = 1 / 0.85985,
                        ExchangeRateDate = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 22), cetTimeZone)
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[1].CurrencyId),
                        Amount = expenses[1].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[2].CurrencyId),
                        Amount = expenses[2].PriceAmount,
                        ExchangeFailure = new Failure
                        {
                            Message = "There is no data to exchange the price. In case the issue persists, contact administrator.", 
                            Type = FailureType.Error
                        }
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[2].CurrencyId),
                        Amount = expenses[2].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = currency,
                        Amount = expenses[3].PriceAmount / 0.86073,
                        ExchangeRate = 1 / 0.86073,
                        ExchangeRateDate = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 26), cetTimeZone)
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[3].CurrencyId),
                        Amount = expenses[3].PriceAmount
                    }
                }
            };
        }
        else if (currencyName == "EUR")
        {
            expectedPrices = new List<ExpensePricePart>
            {
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = currency,
                        Amount = expenses[0].PriceAmount / 1.163,
                        ExchangeRate = 1 / 1.163,
                        ExchangeRateDate = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 22), cetTimeZone)
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[0].CurrencyId),
                        Amount = expenses[0].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[1].CurrencyId),
                        Amount = expenses[1].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[2].CurrencyId),
                        Amount = expenses[2].PriceAmount,
                        ExchangeFailure = new Failure
                        {
                            Message = "There is no data to exchange the price. In case the issue persists, contact administrator.", 
                            Type = FailureType.Error
                        }
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[2].CurrencyId),
                        Amount = expenses[2].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[3].CurrencyId),
                        Amount = expenses[3].PriceAmount
                    }
                }
            };
        }
        else
        {
            expectedPrices = new List<ExpensePricePart>
            {
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[0].CurrencyId),
                        Amount = expenses[0].PriceAmount,
                        ExchangeFailure = new Failure
                        {
                            Message = "There is no data to exchange the price. In case the issue persists, contact administrator.", 
                            Type = FailureType.Error
                        }
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[0].CurrencyId),
                        Amount = expenses[0].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[1].CurrencyId),
                        Amount = expenses[1].PriceAmount,
                        ExchangeFailure = new Failure
                        {
                            Message = "There is no data to exchange the price. In case the issue persists, contact administrator.", 
                            Type = FailureType.Error
                        }
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[1].CurrencyId),
                        Amount = expenses[1].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[2].CurrencyId),
                        Amount = expenses[2].PriceAmount
                    }
                },
                new ExpensePricePart
                {
                    Price = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[3].CurrencyId),
                        Amount = expenses[3].PriceAmount,
                        ExchangeFailure = new Failure
                        {
                            Message = "There is no data to exchange the price. In case the issue persists, contact administrator.", 
                            Type = FailureType.Error
                        }
                    },
                    OriginalPrice = new Price
                    {
                        Currency = this.Currencies.First(c => c.Id == expenses[3].CurrencyId),
                        Amount = expenses[3].PriceAmount
                    }
                }
            };
        }

        result.Select(e => new { e.Price, e.OriginalPrice }).Should().BeEquivalentTo(expectedPrices);
    }

    [Test]
    public void GetExpenses_MainCurrencyNotSet_ExpensesNotHaveExchangedPrices()
    {
        this.DbContext.Attach(this.Daniel);

        var cetTimeZone = TimeZoneInfo.FindSystemTimeZoneById("CET");

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 23), cetTimeZone),
                Name = "Expense A",
                PriceAmount = 51,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2021, 10, 24), cetTimeZone),
                Name = "Expense B",
                PriceAmount = 108,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();
        new CurrenciesRepository(this.DbContext, this.Daniel).DeleteMainCurrency();

        var result = new ExpensesRepository(DbContext, this.Daniel, this.ExchangeServerClientMock?.Object).GetExpenses();

        result.Select(e => new { e.Price, e.OriginalPrice }).Should().BeEquivalentTo(expenses.Select(e => new ExpensePricePart
        {
            Price = new Price
            {
                Currency = this.Currencies.First(c => c.Id == e.CurrencyId),
                Amount = e.PriceAmount
            }
        }));
    }

    [TestCase("")]
    [TestCase("   ")]
    public void CreateExpense_EmptyName_ErrorThrown(string name)
    {
        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id
        };

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams)).Should().Throw<InvalidOperationException>()
            .WithMessage("Expense can't contain empty name.");
    }

    [Test]
    public void CreateExpense_NotExistingCurrency_ErrorThrown()
    {
        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            PriceAmount = 108,
            CurrencyId = -1
        };

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams)).Should().Throw<InvalidOperationException>()
            .WithMessage("Currency with id '-1' doesn't exist.");
    }

    [Theory]
    public void CreateExpense_SharedWithNotConnectedUser_ErrorThrown(bool isConnectionInitialized)
    {
        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = new List<int> { this.Veronika.Id }
        };

        if (isConnectionInitialized)
        {
            new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        }

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams)).Should().Throw<InvalidOperationException>()
            .WithMessage($"You cannot share this expense with users '{this.Veronika.Id}' since you don't have connections with them.");
    }

    [TestCase(false, null)]
    [TestCase(true, null)]
    [TestCase(false, "EUR")]
    [TestCase(true, "EUR")]
    public void CreateExpense_SpecifiedExistingCategory_ExpenseCreated(bool isExpenseShared, string? mainCurrencyName)
    {
        if (isExpenseShared)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var cetTimeZone = TimeZoneInfo.FindSystemTimeZoneById("CET");

        this.ExchangeServerClientMock?
            .Setup(x => x.GetExchangeRates(
                It.IsAny<DateTime>(),
                It.IsAny<DateTime>(),
                It.IsAny<string>()))
            .Returns(new Dictionary<DateTime, Dictionary<string, double>>
            {
                [TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 8, 30), cetTimeZone)] = new Dictionary<string, double>
                {
                    ["USD"] = 1.1087
                }
            });

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            Description = "Test description",
            CategoryName = this.Categories[0].Name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isExpenseShared ? new List<int> { this.Veronika.Id } : new List<int>()
        };

        var mainCurrency = this.Currencies.FirstOrDefault(c => c.Name == mainCurrencyName);

        if (mainCurrency == null)
        {
            new CurrenciesRepository(this.DbContext, this.Daniel).DeleteMainCurrency();
        }
        else
        {
            new CurrenciesRepository(this.DbContext, this.Daniel).SetMainCurrency(mainCurrency.Id);
        }

        var result = new ExpensesRepository(this.DbContext, this.Daniel, this.ExchangeServerClientMock?.Object).CreateExpense(createParams);

        if (isExpenseShared)
        {
            this.Categories[0].PermittedPersons.Add(this.Veronika.ToModel());
        }

        result.Should().BeEquivalentTo(new Expense
        {
            Date = createParams.Date,
            Name = createParams.Name,
            Description = createParams.Description,
            Category = this.Categories[0],
            Price = mainCurrency == null ? new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            } : new Price
            {
                Currency = mainCurrency,
                Amount = createParams.PriceAmount / 1.1087,
                ExchangeRate = 1 / 1.1087,
                ExchangeRateDate = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 8, 30), cetTimeZone)
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isExpenseShared ? new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel() } : new List<Person> { this.Daniel.ToModel() },
            OriginalPrice = mainCurrency == null ? null : new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            }
        }, opt => opt.Excluding(o => o.Id));
    }

    [Theory]
    public void CreateExpense_SpecifiedEmptyCategory_ExpenseCreated(bool isExpenseShared)
    {
        if (isExpenseShared)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            Description = "Test description",
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isExpenseShared ? new List<int> { this.Veronika.Id } : new List<int>()
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams);

        if (isExpenseShared)
        {
            this.Categories[0].PermittedPersons.Add(this.Veronika.ToModel());
        }

        result.Should().BeEquivalentTo(new Expense
        {
            Date = createParams.Date,
            Name = createParams.Name,
            Description = createParams.Description,
            Category = null,
            Price = new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isExpenseShared ? new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel() } : new List<Person> { this.Daniel.ToModel() }
        }, opt => opt.Excluding(o => o.Id));
    }

    [Theory]
    public void CreateExpense_SpecifiedNotExistingCategory_CategoryAndExpenseCreated(bool isExpenseShared)
    {
        if (isExpenseShared)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var categoryName = Guid.NewGuid().ToString();

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            Description = "Test description",
            CategoryName = categoryName,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isExpenseShared ? new List<int> { this.Veronika.Id } : new List<int>()
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams);

        var createdCategory = this.DbContext.Categories.Where(c => c.Name == categoryName && c.CreatedById == this.Daniel.Id).FirstOrDefault()?.ToModel();

        createdCategory.Should().BeEquivalentTo(new Category
        {
            Name = categoryName,
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isExpenseShared ? new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel() } : new List<Person> { this.Daniel.ToModel() } 
        }, opt => opt.Excluding(o => o.Id));

        result.Should().BeEquivalentTo(new Expense
        {
            Date = createParams.Date,
            Name = createParams.Name,
            Description = createParams.Description,
            Category = createdCategory,
            Price = new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isExpenseShared ? new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel() } : new List<Person> { this.Daniel.ToModel() }
        }, opt => opt.Excluding(o => o.Id));
    }

    [Test]
    public void CreateExpense_SharedWithNotCategoryOwner_NewCategoryAlongWithExpenseCreated()
    {
        var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connection.Id);

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            Description = "Test description",
            CategoryName = this.Categories[3].Name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = new List<int> { this.Chuck.Id }
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams);

        var createdCategory = this.DbContext.Categories.Where(c => c.Name == this.Categories[3].Name && c.CreatedById == this.Daniel.Id).FirstOrDefault()?.ToModel();

        createdCategory.Should().BeEquivalentTo(new Category
        {
            Name = this.Categories[3].Name,
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel(), this.Chuck.ToModel() }
        }, opt => opt.Excluding(o => o.Id));

        result.Should().BeEquivalentTo(new Expense
        {
            Date = createParams.Date,
            Name = createParams.Name,
            Description = createParams.Description,
            Category = createdCategory,
            Price = new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel(), this.Chuck.ToModel() }
        }, opt => opt.Excluding(o => o.Id));
    }

    [Theory]
    public void CreateExpense_NotSharedOrSharedWithCategoryOwner_NoNewCategoryAlongWithExpenseCreated(bool isSharedWithCategoryOwner)
    {
        if (isSharedWithCategoryOwner)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            Description = "Test description",
            CategoryName = this.Categories[3].Name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isSharedWithCategoryOwner ? new List<int> { this.Veronika.Id } : new List<int>()
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).CreateExpense(createParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Date = createParams.Date,
            Name = createParams.Name,
            Description = createParams.Description,
            Category = this.Categories[3],
            Price = new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isSharedWithCategoryOwner ? new List<Person> { this.Veronika.ToModel(), this.Daniel.ToModel() } : new List<Person> { this.Daniel.ToModel() }
        }, opt => opt.Excluding(o => o.Id));
    }

    [TestCase(DanielTenant, 5)]
    [TestCase(VeronikaTenant, 6)]
    [TestCase(ChuckTenant, 7)]
    public void CreateExpense_CategoryWithTheSameName_ExpenseCreatedWithRightCategory(string userTenant, int resolvedCategoryIndex)
    {
        var connectionA = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connectionA.Id);
        var connectionB = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionB.Id);
        var connectionC = new ConnectionsRepository(this.DbContext, this.Veronika).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionC.Id);

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8),
            Name = "Test expense",
            Description = "Test description",
            CategoryName = "SameCategory",
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = new List<int> { this.Daniel.Id, this.Veronika.Id, this.Chuck.Id }
        };

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        var result = new ExpensesRepository(this.DbContext, user!).CreateExpense(createParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Date = createParams.Date,
            Name = createParams.Name,
            Description = createParams.Description,
            Category = this.Categories[resolvedCategoryIndex],
            Price = new Price
            {
                Amount = createParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = user!.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel(), this.Chuck.ToModel() }
        }, opt => opt.Excluding(o => o.Id));
    }

    [TestCase("")]
    [TestCase("   ")]
    public void UpdateExpense_EmptyName_ErrorThrown(string name)
    {
        this.DbContext.Attach(this.Daniel);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[0].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Daniel.Id,
            PermittedPersons = new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8, DateTimeKind.Utc),
            Name = name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id
        };

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, changeParams)).Should().Throw<InvalidOperationException>()
            .WithMessage("Expense can't contain empty name.");
    }

    [Test]
    public void UpdateExpense_NotExistingCurrency_ErrorThrown()
    {
        this.DbContext.Attach(this.Daniel);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[0].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Daniel.Id,
            PermittedPersons = new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8),
            Name = Guid.NewGuid().ToString(),
            PriceAmount = 108,
            CurrencyId = -1
        };

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, createParams)).Should().Throw<InvalidOperationException>()
            .WithMessage("Currency with id '-1' doesn't exist.");
    }

    [Test]
    public void UpdateExpense_SharedWithNotConnectedUser_ErrorThrown()
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[0].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Veronika.Id,
            PermittedPersons = new List<Entities.Person> { this.Veronika, this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var createParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8),
            Name = Guid.NewGuid().ToString(),
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id
        };

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, createParams)).Should().Throw<InvalidOperationException>()
            .WithMessage("You don't have permissions to edit the expense.");
    }

    [TestCase(false, null)]
    [TestCase(true, null)]
    [TestCase(false, "EUR")]
    [TestCase(true, "EUR")]

    public void UpdateExpense_EmptyCategorySpecified_ExpenseUpdated(bool isSharedExpense, string? mainCurrencyName)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var cetTimeZone = TimeZoneInfo.FindSystemTimeZoneById("CET");

        this.ExchangeServerClientMock?
            .Setup(x => x.GetExchangeRates(
                It.IsAny<DateTime>(),
                It.IsAny<DateTime>(),
                It.IsAny<string>()))
            .Returns(new Dictionary<DateTime, Dictionary<string, double>>
            {
                [TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 8, 1), cetTimeZone)] = new Dictionary<string, double>
                {
                    ["USD"] = 1.0789
                }
            });

        var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[3].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = isSharedExpense ? this.Veronika.Id : this.Daniel.Id,
            PermittedPersons = isSharedExpense ? new List<Entities.Person> { this.Veronika, this.Daniel } : new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8),
            Name = Guid.NewGuid().ToString(),
            PriceAmount = 1108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isSharedExpense ? new List<int> { this.Daniel.Id } : new List<int> { this.Veronika.Id, this.Daniel.Id }
        };

        var mainCurrency = this.Currencies.FirstOrDefault(c => c.Name == mainCurrencyName);

        if (mainCurrency == null)
        {
            new CurrenciesRepository(this.DbContext, this.Daniel).DeleteMainCurrency();
        }
        else
        {
            new CurrenciesRepository(this.DbContext, this.Daniel).SetMainCurrency(mainCurrency.Id);
        }

        var result = new ExpensesRepository(this.DbContext, this.Daniel, this.ExchangeServerClientMock?.Object).UpdateExpense(expense.Id, changeParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = null,
            Price = mainCurrency == null ? new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            } : new Price
            {
                Currency = mainCurrency,
                Amount = changeParams.PriceAmount / 1.0789,
                ExchangeRate = 1 / 1.0789,
                ExchangeRateDate = TimeZoneInfo.ConvertTimeToUtc(new DateTime(2024, 8, 1), cetTimeZone)
            },
            CreatedBy = isSharedExpense ? this.Veronika.ToModel() : this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Veronika.ToModel(), this.Daniel.ToModel() },
            OriginalPrice = mainCurrency == null ? null : new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            }
        });
    }

    [Theory]
    public void UpdateExpense_NotExistingCategorySpecified_NewCategoryCreatedAlongWithExpenseUpdating(bool isSharedExpense)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[4].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = isSharedExpense ? this.Veronika.Id : this.Daniel.Id,
            PermittedPersons = isSharedExpense ? new List<Entities.Person> { this.Veronika, this.Daniel, this.Chuck } : new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var newCategoryName = Guid.NewGuid().ToString();

        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8),
            Name = Guid.NewGuid().ToString(),
            CategoryName = newCategoryName,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = new List<int> { this.Daniel.Id, this.Veronika.Id }
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, changeParams);

        var createdCategory = this.DbContext.Categories.Where(c => c.Name == newCategoryName && c.CreatedById == this.Daniel.Id).FirstOrDefault()?.ToModel();

        createdCategory.Should().BeEquivalentTo(new Category
        {
            Name = newCategoryName,
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isSharedExpense ? new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel(), this.Chuck.ToModel() } : new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel() }
        }, opt => opt.Excluding(o => o.Id));

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = createdCategory,
            Price = new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = isSharedExpense ? this.Veronika.ToModel() : this.Daniel.ToModel(),
            PermittedPersons = isSharedExpense ? new List<Person> { this.Veronika.ToModel(), this.Daniel.ToModel(), this.Chuck.ToModel() } : new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel() }
        });
    }

    [Theory]
    public void UpdateExpense_SharedWithCategoryPermittees_NoNewCategoryCreatedAlongWithExpenseUpdating(bool isSharedExpense)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[0].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = isSharedExpense ? this.Veronika.Id : this.Daniel.Id,
            PermittedPersons = isSharedExpense ? new List<Entities.Person> { this.Daniel, this.Veronika } : new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8),
            Name = Guid.NewGuid().ToString(),
            CategoryName = this.Categories[4].Name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isSharedExpense ? new List<int>() : new List<int> { this.Daniel.Id, this.Veronika.Id }
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, changeParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = this.Categories[4],
            Price = new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = isSharedExpense ? this.Veronika.ToModel() : this.Daniel.ToModel(),
            PermittedPersons = { this.Veronika.ToModel(), this.Daniel.ToModel() }
        });
    }

    [Theory]
    public void UpdateExpense_SharedWithNotCategoryPermittees_NewCategoryCreatedAlongWithExpenseUpdating(bool arePermitteesChanged)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var connectionA = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connectionA.Id);
        var connectionB = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionB.Id);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = arePermitteesChanged ? this.Categories[3].Id : this.Categories[4].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Daniel.Id,
            PermittedPersons = arePermitteesChanged ? new List<Entities.Person> { this.Daniel, this.Veronika } : new List<Entities.Person> { this.Daniel, this.Veronika, this.Chuck }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8),
            Name = Guid.NewGuid().ToString(),
            CategoryName = this.Categories[3].Name,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = new List<int> { this.Daniel.Id, this.Veronika.Id, this.Chuck.Id }
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, changeParams);

        var createdCategory = this.DbContext.Categories.Where(c => c.Name == this.Categories[3].Name && c.CreatedById == this.Daniel.Id).FirstOrDefault()?.ToModel();

        createdCategory.Should().BeEquivalentTo(new Category
        {
            Name = this.Categories[3].Name,
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel(), this.Chuck.ToModel() }
        }, opt => opt.Excluding(o => o.Id));

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = createdCategory,
            Price = new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = { this.Veronika.ToModel(), this.Daniel.ToModel(), this.Chuck.ToModel() }
        });
    }

    [TestCase(DanielTenant, DanielTenant, 5)]
    [TestCase(DanielTenant, VeronikaTenant, 5)]
    [TestCase(DanielTenant, ChuckTenant, 5)]
    [TestCase(VeronikaTenant, DanielTenant, 6)]
    [TestCase(VeronikaTenant, VeronikaTenant, 6)]
    [TestCase(VeronikaTenant, ChuckTenant, 6)]
    [TestCase(ChuckTenant, DanielTenant, 7)]
    [TestCase(ChuckTenant, VeronikaTenant, 7)]
    [TestCase(ChuckTenant, ChuckTenant, 7)]
    public void UpdateExpense_CategoryWithTeSameName_ExpenseUpdatedWithRightCategory(string creatorTenant, string changePersonTenant, int resolvedCategoryIndex)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var connectionA = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connectionA.Id);
        var connectionB = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionB.Id);
        var connectionC = new ConnectionsRepository(this.DbContext, this.Veronika).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionC.Id);

        var creator = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == creatorTenant);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[4].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = creator!.Id,
            PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika, this.Chuck }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();
        
        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 10, 8),
            Name = "Test expense",
            Description = "Test description",
            CategoryName = "SameCategory",
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = new List<int> { this.Daniel.Id, this.Veronika.Id, this.Chuck.Id }
        };

        var changePerson = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == changePersonTenant);

        var result = new ExpensesRepository(this.DbContext, changePerson!).UpdateExpense(expense.Id, changeParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = this.Categories[resolvedCategoryIndex],
            Price = new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = creator!.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel(), this.Veronika.ToModel(), this.Chuck.ToModel() }
        }, opt => opt.Excluding(o => o.Id));
    }

    [Test]
    public void UpdateExpense_NotConnectedUserAlreadyInPermitteesList_ExpenseUpdated()
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[3].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Daniel.Id,
            PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var changeParams = new ChangeExpenseParams
        {
            Date = new DateTime(2024, 8, 1, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryName = this.Categories[2].Name,
            PriceAmount = 108108,
            CurrencyId = this.Currencies[1].Id,
            PermittedPersonsIds = new List<int> { this.Daniel.Id, this.Veronika.Id }
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, changeParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = this.Categories[2],
            Price = new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[1]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = { this.Veronika.ToModel(), this.Daniel.ToModel() }
        });
    }

    [Test]
    public void DeleteExpense_ExpenseNotExist_ErrorThrown()
    {
        new Action(() => new ExpensesRepository(this.DbContext, this.Veronika).DeleteExpense(-1)).Should().Throw<InvalidOperationException>()
            .WithMessage("Expense with id '-1' doesn't exist.");
    }

    [Test]
    public void DeleteExpense_SharedExpense_DeletesRelationshipOnly()
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[4].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Daniel.Id,
            PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        new ExpensesRepository(this.DbContext, this.Veronika).DeleteExpense(expense.Id);

        var existingExpense = this.DbContext.Expenses.Where(e => e.Id == expense.Id).Include(e => e.Category!.PermittedPersons).Include(e => e.PermittedPersons).FirstOrDefault()?.ToModel(null);

        existingExpense.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = expense.Date,
            Name = expense.Name,
            Description = expense.Description,
            Category = this.Categories[4],
            Price = new Price
            {
                Amount = expense.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel() }
        });
    }

    [Theory]
    public void DeleteExpense_ExpenseOwnerDeleting_ExpenseDeleted(bool isShared)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        if (isShared)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var expense = new Entities.Expense
        {
            Date = new DateTime(2024, 8, 30, 17, 01, 8, DateTimeKind.Utc),
            Name = Guid.NewGuid().ToString(),
            CategoryId = this.Categories[4].Id,
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            CreatedById = this.Daniel.Id,
            PermittedPersons = isShared ? new List<Entities.Person> { this.Daniel, this.Veronika } : new List<Entities.Person> { this.Daniel }
        };

        this.DbContext.Expenses.Add(expense);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        new ExpensesRepository(this.DbContext, this.Daniel).DeleteExpense(expense.Id);

        var existingExpense = this.DbContext.Expenses.Find(expense.Id);

        existingExpense.Should().BeNull();
    }

    [TestCase("W", new [] { 1 })]
    [TestCase("Wlt", new [] { 0, 1, 2 })]
    [TestCase("Wolt", new [] { 0, 1, 2 })]
    [TestCase("Konzm", new [] { 3, 4 })]
    [TestCase("Test", new int[] { 0, 2, 4 })]
    public void FindExpenseNames_TermToSearch_CorrectedExpensesListReturned(string term, int[] expensesIndexes)
    {
        this.DbContext.Attach(this.Daniel);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 8, 1).ToUniversalTime(),
                Name = "Wolt Test",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 42,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Wolt",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 1108,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Wolt Test",
                PriceAmount = 110,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
                Name = "Konzum",
                PriceAmount = 73,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 07, 10).ToUniversalTime(),
                Name = "Konzum Test",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 730,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(expenses);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var result = new ExpensesRepository(DbContext, this.Daniel).FindExpenseNames(term);

        var expected = expensesIndexes.Select(i => new ExtendedExpenseName
        {
            Name = expenses[i].Name,
            CategoryName = expenses[i].Category?.Name
        });

        result.Should().BeEquivalentTo(expected);
    }

    [SetUp]
    public void ExpensesRepositoryTestsSetUp()
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);
        this.DbContext.Attach(this.Chuck);

        var categories = new List<Entities.Category>
        {
            new Entities.Category()
            {
                Name = "Category 1",
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person>{ this.Daniel }
            },
            new Entities.Category()
            {
                Name = "Category 2",
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person>{ this.Veronika }
            },
            new Entities.Category()
            {
                Name = "Category 3",
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person>{ this.Daniel, this.Veronika }
            },
            new Entities.Category()
            {
                Name = "Category 4",
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person>{ this.Veronika, this.Daniel }
            },
            new Entities.Category()
            {
                Name = "Category 5",
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person>{ this.Veronika, this.Daniel, this.Chuck }
            },
            new Entities.Category()
            {
                Name = "SameCategory",
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person>{ this.Veronika, this.Daniel, this.Chuck }
            },
            new Entities.Category()
            {
                Name = "SameCategory",
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person>{ this.Veronika, this.Daniel, this.Chuck }
            },
            new Entities.Category()
            {
                Name = "SameCategory",
                CreatedById = this.Chuck.Id,
                PermittedPersons = new List<Entities.Person>{ this.Veronika, this.Daniel, this.Chuck }
            }
        };

        this.DbContext.AddRange(categories);
        this.DbContext.SaveChanges();

        this.Categories = categories.Select(c => c.ToModel()).ToList();

        this.ClearChangeTracker();

        this.ExchangeServerClientMock?
            .Setup(x => x.GetExchangeRates(
                It.IsAny<DateTime>(),
                It.IsAny<DateTime>(),
                It.IsAny<string>()))
            .Returns(new Dictionary<DateTime, Dictionary<string, double>>());
    }

    [OneTimeSetUp]
    public void ExpensesRepositoryTestsOneTimeSetUp()
    {
        var currencies = new List<Entities.Currency>
        {
            new Entities.Currency
            {
                Name = "USD",
                FriendlyName = "American Dollar",
                FlagCode = "FC1"
            },
            new Entities.Currency
            {
                Name = "EUR",
                FriendlyName = "Euro",
                FlagCode = "FC2"
            },
            new Entities.Currency
            {
                Name = "XXX",
                FriendlyName = "Not existing currency",
                FlagCode = "FC2"
            }
        };

        this.DbContext.AddRange(currencies);
        this.DbContext.SaveChanges();

        var currencyMappings = new List<Entities.CurrencyMapping>
        {
            new Entities.CurrencyMapping
            {
                CurrencyId = currencies[0].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = currencies[1].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            },
            new Entities.CurrencyMapping
            {
                CurrencyId = currencies[2].Id,
                PersonId = this.Daniel.Id,
                IsMainCurrency = false,
            }
        };

        this.DbContext.AddRange(currencyMappings);
        this.DbContext.SaveChanges();

        this.Currencies = currencies.Select(c => c.ToModel()).ToList();

        this.ClearChangeTracker();

        this.ExchangeServerClientMock = new Mock<IExchangeServerClient>();
    }
}

internal class ExpensePricePart
{
    public required Price Price { get; set; }

    public Price? OriginalPrice { get; set; }
}