namespace Backend.Tests.Repositories;

using Backend.Application;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
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
                Date = DateTime.Now.ToUniversalTime(),
                Name = "Expense A",
                CategoryId = this.Categories[0].Id,
                PriceAmount = 108,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = DateTime.Now.ToUniversalTime(),
                Name = "Expense B",
                PriceAmount = 11,
                CurrencyId = this.Currencies[1].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Expense
            {
                Date = DateTime.Now.ToUniversalTime(),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Expense
            {
                Date = DateTime.Now.ToUniversalTime(),
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

    [Test]
    public void GetExpenses_FilterByYearAndMonth_ExpensesForSpecifiedYearAnMontReturned()
    {
        this.DbContext.Attach(this.Daniel);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 08, 1).ToUniversalTime(),
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
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 07, 29).ToUniversalTime(),
                Name = "Expense C",
                CategoryId = this.Categories[1].Id,
                PriceAmount = 99.9,
                CurrencyId = this.Currencies[0].Id,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Expense
            {
                Date = new DateTime(2024, 08, 20).ToUniversalTime(),
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
            Month = 8
        });

        result.Select(e => e.Name).Should().BeEquivalentTo(new [] { "Expense A", "Expense D" });
    }

    [TestCase(2024, null)]
    [TestCase(null, 8)]
    [TestCase(null, null)]
    public void GetExpenses_FilterWithMissingYearOrMonth_AllExpensesReturned(int? year, int? month)
    {
        this.DbContext.Attach(this.Daniel);

        var expenses = new List<Entities.Expense>
        {
            new Entities.Expense
            {
                Date = new DateTime(2024, 08, 1).ToUniversalTime(),
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
            Month = month
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
                Date = new DateTime(2024, 08, 1).ToUniversalTime(),
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

    [TestCase("")]
    [TestCase("   ")]
    public void CreateExpense_EmptyName_ErrorThrown(string name)
    {
        var createParams = new ChangeExpenseParams
        {
            Date = DateTime.Now,
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
            Date = DateTime.Now,
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
            Date = DateTime.Now,
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

    [Theory]
    public void CreateExpense_SpecifiedExistingCategory_ExpenseCreated(bool isExpenseShared)
    {
        if (isExpenseShared)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var createParams = new ChangeExpenseParams
        {
            Date = DateTime.Now,
            Name = "Test expense",
            Description = "Test description",
            CategoryName = this.Categories[0].Name,
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
            Category = this.Categories[0],
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
    public void CreateExpense_SpecifiedEmptyCategory_ExpenseCreated(bool isExpenseShared)
    {
        if (isExpenseShared)
        {
            var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
            new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);
        }

        var createParams = new ChangeExpenseParams
        {
            Date = DateTime.Now,
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
            Date = DateTime.Now,
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
            Date = DateTime.Now,
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
            Date = DateTime.Now,
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
    public void CreateExpense_CategoryWithTeSameName_ExpenseCreatedWithRightCategory(string userTenant, int resolvedCategoryIndex)
    {
        var connectionA = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connectionA.Id);
        var connectionB = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionB.Id);
        var connectionC = new ConnectionsRepository(this.DbContext, this.Veronika).CreateConnectionRequest(this.Chuck.Id);
        new ConnectionsRepository(this.DbContext, this.Chuck).AcceptConnectionRequest(connectionC.Id);

        var createParams = new ChangeExpenseParams
        {
            Date = DateTime.Now,
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
            Name = Guid.NewGuid().ToString(),
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id
        };

        new Action(() => new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, createParams)).Should().Throw<InvalidOperationException>()
            .WithMessage("You don't have permissions to edit the expense.");
    }

    [Theory]
    public void UpdateExpense_EmptyCategorySpecified_ExpenseUpdated(bool isSharedExpense)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var connection = new ConnectionsRepository(this.DbContext, this.Daniel).CreateConnectionRequest(this.Veronika.Id);
        new ConnectionsRepository(this.DbContext, this.Veronika).AcceptConnectionRequest(connection.Id);

        var expense = new Entities.Expense
        {
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
            Name = Guid.NewGuid().ToString(),
            PriceAmount = 108,
            CurrencyId = this.Currencies[0].Id,
            PermittedPersonsIds = isSharedExpense ? new List<int> { this.Daniel.Id } : new List<int> { this.Veronika.Id, this.Daniel.Id }
        };

        var result = new ExpensesRepository(this.DbContext, this.Daniel).UpdateExpense(expense.Id, changeParams);

        result.Should().BeEquivalentTo(new Expense
        {
            Id = expense.Id,
            Date = changeParams.Date,
            Name = changeParams.Name,
            Description = changeParams.Description,
            Category = null,
            Price = new Price
            {
                Amount = changeParams.PriceAmount,
                Currency = this.Currencies[0]
            },
            CreatedBy = isSharedExpense ? this.Veronika.ToModel() : this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Veronika.ToModel(), this.Daniel.ToModel() }
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
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
            Date = DateTime.Now.ToUniversalTime(),
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
            Date = DateTime.Now,
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
            Date = DateTime.Now.ToUniversalTime(),
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
                Date = new DateTime(2024, 08, 1).ToUniversalTime(),
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
                Date = new DateTime(2024, 06, 13).ToUniversalTime(),
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
            Date = DateTime.Now.ToUniversalTime(),
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
    }

    [OneTimeSetUp]
    public void test()
    {
        var currencies = new List<Entities.Currency>
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
            }
        };

        this.DbContext.AddRange(currencies);
        this.DbContext.SaveChanges();

        this.Currencies = currencies.Select(c => c.ToModel()).ToList();
        this.ClearChangeTracker();
    }
}
