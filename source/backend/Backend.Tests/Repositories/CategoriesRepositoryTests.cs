namespace Backend.Tests.Repositories;

using Backend.Application;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
using FluentAssertions;
using Entities = Domain.Entities;

[TestFixture]
public class CategoriesRepositoryTests : TestsBase
{
    protected override bool ShouldCategoriesBeDeletedInTearDown => true;

    [TestCase(DanielTenant, ExpectedResult = 4)]
    [TestCase(VeronikaTenant, ExpectedResult = 2)]
    public int GetUniqueCategoryNames_CategoriesExistForMultipleUsers_ReturnsUniqueCategoriesForSpecificUserOnly(string userTenant)
    {
        this.DbContext.Attach(this.Daniel);
        this.DbContext.Attach(this.Veronika);

        var categoryName = Guid.NewGuid().ToString();

        var categories = new List<Entities.Category>
        {
            new Entities.Category
            {
                Name = Guid.NewGuid().ToString(),
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Category
            {
                Name = Guid.NewGuid().ToString(),
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Category
            {
                Name = Guid.NewGuid().ToString(),
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Category
            {
                Name = Guid.NewGuid().ToString(),
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Category
            {
                Name = categoryName,
                CreatedById = this.Daniel.Id,
                PermittedPersons = new List<Entities.Person> { this.Daniel, this.Veronika }
            },
            new Entities.Category
            {
                Name = categoryName,
                CreatedById = this.Veronika.Id,
                PermittedPersons = new List<Entities.Person> { this.Veronika, this.Daniel }
            }
        };

        this.DbContext.AddRange(categories);
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        var user = this.DbContext.Persons.FirstOrDefault(p => p.Tenant.ToString() == userTenant);

        var result = new CategoriesRepository(this.DbContext, user!).GetUniqueCategoryNames();

        return result.Count();
    }

    [Test]
    public void CreateCategory_EmptyCreatedBy_ErrorThrows()
    {
        var category = new Category
        {
            Name = Guid.NewGuid().ToString()
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contain a reference to a person who created it.");
    }

    [Test]
    public void CreateCategory_CreatorUserNotExist_ErrorThrows()
    {
        var category = new Category
        {
            Name = Guid.NewGuid().ToString(),
            CreatedBy = new Person
            {
                Id = -1,
                FirstName = "User",
                SecondName = "Not exist",
                Tenant = Guid.NewGuid()
            }
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("User with id '-1' doesn't exist and cannot be set as creator.");
    }

    [Test]
    public void CreateCategory_CreatedByIsNotUserWhoCreateCategory_ErrorThrows()
    {
        var category = new Category
        {
            Name = Guid.NewGuid().ToString(),
            CreatedBy = this.Veronika.ToModel()
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category cannot be created on behalf of another user.");
    }

    [TestCase("")]
    [TestCase("  ")]
    [TestCase(null)]
    public void CreateCategory_EmptyName_ErrorThrows(string? name)
    {
        var category = new Category
        {
            Name = name,
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel() }
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Name cannot be empty.");
    }

    [Test]
    public void CreateCategory_NameNotUnique_ErrorThrows()
    {
        this.DbContext.Attach(this.Daniel);

        var categoryName = Guid.NewGuid().ToString();

        var category = new Category
        {
            Name = categoryName.ToUpper(),
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel() }
        };

        this.DbContext.Categories.Add(new Entities.Category
        {
            Name = categoryName,
            CreatedById = this.Daniel.Id,
            PermittedPersons = new List<Entities.Person> { this.Daniel }
        });
        this.DbContext.SaveChanges();

        this.ClearChangeTracker();

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contain unique name.");
    }

    [Test]
    public void CreateCategory_NotExistingUsersInPermittedPersonsList_ErrorThrows()
    {
        var category = new Category
        {
            Name = Guid.NewGuid().ToString(),
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person>
            { 
                this.Daniel.ToModel(),
                new Person
                {
                    Id = -1,
                    FirstName = "User",
                    SecondName = "-1",
                    Tenant = Guid.NewGuid()
                },
                new Person
                {
                    Id = -2,
                    FirstName = "User",
                    SecondName = "-2",
                    Tenant = Guid.NewGuid()
                }
            }
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Users with IDs '-1, -2' don't exist and cannot be associated with the category.");
    }

    [Theory]
    public void CreateCategory_ModelIsCorrect_CategoryCreated(bool isPermittedPersonsSpecified)
    {
        var category = new Category
        {
            Name = Guid.NewGuid().ToString(),
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = isPermittedPersonsSpecified ? new List<Person> { this.Daniel.ToModel() } : new List<Person>()
        };

        var createdCategoryId = new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category);

        if (!isPermittedPersonsSpecified)
        {
            category.PermittedPersons = new List<Person> { this.Daniel.ToModel() };
        }

        var createdCategory = this.DbContext.Categories.Find(createdCategoryId);
    
        createdCategory.Should().NotBeNull();
        createdCategory!.ToModel().Should().BeEquivalentTo(category);
    }
}
