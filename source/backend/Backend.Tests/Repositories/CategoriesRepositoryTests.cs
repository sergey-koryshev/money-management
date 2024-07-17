namespace Backend.Tests;

using Backend.Application;
using Backend.Domain.Models;
using FluentAssertions;
using Entities = Domain.Entities;

[TestFixture]
public class CategoriesRepositoryTests : TestsBase
{
    private const string prefix = "CategoriesRepositoryTests_";

    [Test]
    public void GetAllCategories_ReturnsAllCategoriesForSpecificUser()
    {
        var categories = new List<Entities.Category>
        {
            new Entities.Category
            {
                Name = $"{prefix}{Guid.NewGuid()}",
                CreatedById = this.Daniel.Id,
                CreatedBy = this.Daniel,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Category
            {
                Name = $"{prefix}{Guid.NewGuid()}",
                CreatedById = this.Veronika.Id,
                CreatedBy = this.Veronika,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Category
            {
                Name = $"{prefix}{Guid.NewGuid()}",
                CreatedById = this.Veronika.Id,
                CreatedBy = this.Veronika,
                PermittedPersons = new List<Entities.Person> { this.Veronika }
            },
            new Entities.Category
            {
                Name = $"{prefix}{Guid.NewGuid()}",
                CreatedById = this.Daniel.Id,
                CreatedBy = this.Daniel,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            },
            new Entities.Category
            {
                Name = $"{prefix}{Guid.NewGuid()}",
                CreatedById = this.Daniel.Id,
                CreatedBy = this.Daniel,
                PermittedPersons = new List<Entities.Person> { this.Daniel }
            }
        };

        this.DbContext.AddRange(categories);
        this.DbContext.SaveChanges();

        var result = new CategoriesRepository(this.DbContext, this.Daniel).GetAllCategories();

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
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel() }
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Name cannot be empty.");
    }

    [Test]
    public void CreateCategory_EmptyCreatedBy_ErrorThrows()
    {
        var category = new Category
        {
            Name = "Category",
            PermittedPersons = new List<Person> { this.Daniel.ToModel() }
        };

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contain a reference to a person who created it.");
    }

    [Test]
    public void CreateCategory_NameNotUnique_ErrorThrows()
    {
        var categoryName = $"{prefix}{Guid.NewGuid()}";

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
            CreatedBy = this.Daniel,
            PermittedPersons = new List<Entities.Person> { this.Daniel }
        });
        this.DbContext.SaveChanges();

        new Action(() => new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category))
            .Should().Throw<InvalidOperationException>()
            .WithMessage("Category must contain unique name.");
    }

    [Test]
    public void CreateCategory_ModelIsCorrect_CategoryCreated()
    {
        var category = new Category
        {
            Name = $"{prefix}{Guid.NewGuid()}",
            CreatedBy = this.Daniel.ToModel(),
            PermittedPersons = new List<Person> { this.Daniel.ToModel() }
        };

        var createdCategoryId = new CategoriesRepository(this.DbContext, this.Daniel).CreateCategory(category);
        var createdCategory = this.DbContext.Categories.Find(createdCategoryId);
    
        createdCategory.Should().NotBeNull();
        createdCategory!.ToModel().Should().BeEquivalentTo(category);
    }

    [TearDown]
    public void TearDown()
    {
        foreach (var entity in this.DbContext.Categories.Where(c => c.Name != null && c.Name.StartsWith(prefix)))
        {
            this.DbContext.Categories.Remove(entity);
        }

        this.DbContext.SaveChanges();
    }
}
