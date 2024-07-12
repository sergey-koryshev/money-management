namespace Backend.Tests;

using Backend.Application;
using Backend.Domain.Models;
using Backend.Infrastructure;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Entities = Domain.Entities;

[TestFixture]
public class CategoriesRepositoryTests
{
    private Mock<AppDbContext> mockedDbContext;
    private Entities.Person daniel;
    private Entities.Person veronika;

    [Test]
    public void GetAllCategories_ReturnsAllCategoriesForSpecificUser()
    {
        var categories = new List<Entities.Category>
        {
            new Entities.Category
            {
                Id = 1,
                Name = "Category A",
                CreatedById = 1,
                CreatedBy = this.daniel,
                PermittedPersons = new List<Entities.Person> { this.daniel }
            },
            new Entities.Category
            {
                Id = 2,
                Name = "Category B",
                CreatedById = 2,
                CreatedBy = this.veronika,
                PermittedPersons = new List<Entities.Person> { this.veronika }
            },
            new Entities.Category
            {
                Id = 3,
                Name = "Category C",
                CreatedById = 2,
                CreatedBy = this.veronika,
                PermittedPersons = new List<Entities.Person> { this.veronika }
            },
            new Entities.Category
            {
                Id = 4,
                Name = "Category D",
                CreatedById = 1,
                CreatedBy = this.daniel,
                PermittedPersons = new List<Entities.Person> { this.daniel }
            },
            new Entities.Category
            {
                Id = 5,
                Name = "Category E",
                CreatedById = 1,
                CreatedBy = this.daniel,
                PermittedPersons = new List<Entities.Person> { this.daniel }
            }
        };

        this.mockedDbContext.Setup(c => c.Categories).Returns(new Mock<DbSet<Entities.Category>>().InitializeMock(categories).Object);

        var result = new CategoriesRepository(this.mockedDbContext.Object, this.daniel).GetAllCategories();

        result.Should().HaveCount(3);
    }

    [TestCase("")]
    [TestCase("  ")]
    [TestCase(null)]
    public void CreateCategory_EmptyName_ErrorThrows(string? name)
    {
        var category = new Category
        {
            Name = name,
            CreatedBy = this.daniel.ToModel(),
            PermittedPersons = new List<Person> { this.daniel.ToModel() }
        };

        new Action(() => new CategoriesRepository(this.mockedDbContext.Object, this.daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Name cannot be empty.");
    }

    [Test]
    public void CreateCategory_PermittedPersonsFieldNotContainsCreator_ErrorThrows()
    {
        var category = new Category
        {
            Name = "Category",
            CreatedBy = this.daniel.ToModel(),
        };

        new Action(() => new CategoriesRepository(this.mockedDbContext.Object, this.daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contains a creator in permitted persons list.");
    }

    [Test]
    public void CreateCategory_EmptyCreatedBy_ErrorThrows()
    {
        var category = new Category
        {
            Name = "Category",
            PermittedPersons = new List<Person> { this.daniel.ToModel() }
        };

        new Action(() => new CategoriesRepository(this.mockedDbContext.Object, this.daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contain a reference to a person who created it.");
    }

    [Test]
    public void CreateCategory_NameNotUnique_ErrorThrows()
    {
        var category = new Category
        {
            Name = "Category",
            CreatedBy = this.daniel.ToModel(),
            PermittedPersons = new List<Person> { this.daniel.ToModel() }
        };

        this.mockedDbContext
            .Setup(c => c.Categories)
            .Returns(new Mock<DbSet<Entities.Category>>().InitializeMock(new List<Entities.Category>
            {
                new Entities.Category
                {
                    Id = 1,
                    Name = "caTegoRy",
                    CreatedById = this.daniel.Id,
                    CreatedBy = this.daniel,
                    PermittedPersons = new List<Entities.Person> { this.daniel }
                }
            }).Object);

        new Action(() => new CategoriesRepository(this.mockedDbContext.Object, this.daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contain unique name.");
    }

    [Test]
    public void CreateCategory_ModelIsCorrect_CategoryCreated()
    {
        var category = new Category
        {
            Name = "Category",
            CreatedBy = this.daniel.ToModel(),
            PermittedPersons = new List<Person> { this.daniel.ToModel() }
        };

        this.mockedDbContext
            .Setup(c => c.Categories)
            .Returns(new Mock<DbSet<Entities.Category>>().InitializeMock(new List<Entities.Category>()).Object);

        var createdCategoryId = new CategoriesRepository(this.mockedDbContext.Object, this.daniel).CreateCategory(category);

        var createdCategory = this.mockedDbContext.Object.Categories.Find(createdCategoryId);
        var a = this.mockedDbContext.Object.Categories.Count();
        createdCategory.Should().NotBeNull();
    }

    [OneTimeSetUp]
    public void InitializeTestFixture()
    {
        this.mockedDbContext = new Mock<AppDbContext>();

        this.daniel = new Entities.Person
        {
            Id = 1,
            FirstName = "Daniel",
            SecondName = "Moriarty",
            Tenant = Guid.NewGuid()
        };

        this.veronika = new Entities.Person
        {
            Id = 2,
            FirstName = "Veronika",
            SecondName = "Payne",
            Tenant = Guid.NewGuid()
        };

        this.mockedDbContext
            .Setup(c => c.Persons)
            .Returns(new Mock<DbSet<Entities.Person>>().InitializeMock(new List<Entities.Person>
            {
                this.daniel,
                this.veronika
            }).Object);
    }
}
