namespace Backend.Application;

using Backend.Domain.Models;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Entities = Domain.Entities;

public class CategoriesRepository
{
    private readonly AppDbContext dbContext;
    private readonly Entities.Person identity;

    public CategoriesRepository(AppDbContext dbContext, Entities.Person identity)
    {
        this.dbContext = dbContext;
        this.identity = identity;
    }

    public List<Category> GetAllCategories()
    {
        return this.GetCategoriesQuery().Select(c => c.ToModel()).ToList();
    }

    public int CreateCategory(Category categoryModel)
    {
        this.ValidateModel(categoryModel);

        var newEntity = new Entities.Category();
        this.UpdateEntity(newEntity, categoryModel);
        this.dbContext.SaveChanges();

        categoryModel.Id = newEntity.Id;
        return newEntity.Id;
    }

    private IQueryable<Entities.Category> GetCategoriesQuery() {
        return this.dbContext.Categories
            .Include(c => c.CreatedBy)
            .Where(c => c.PermittedPersons.Any(p => p.Id == this.identity.Id));
    }

    private void UpdateEntity(Entities.Category entity, Category model)
    {
        entity.Name = model.Name;
        entity.CreatedById = model.CreatedBy?.Id ?? this.identity.Id;

        var permittedPersonsIds = model.PermittedPersons.Select(p => p.Id).ToHashSet();
        var permittedPersons = this.dbContext.Persons.Where(p => permittedPersonsIds.Contains(p.Id)).ToList();
        entity.PermittedPersons = permittedPersons;
    }

    private void ValidateModel(Category model)
    {
        if (model.CreatedBy == null)
        {
            throw new InvalidOperationException("Category must contain a reference to a person who created it.");
        }

        if (model.Name == null)
        {
            throw new InvalidOperationException("Name cannot be empty.");
        }

        if (!model.PermittedPersons.Any(p => p.Id == model.CreatedBy.Id))
        {
            throw new InvalidOperationException("Category must contains a creator in permitted persons list.");
        }

        if (this.dbContext.Categories.Any(c => c.CreatedById == model.CreatedBy.Id && c.Name != null && c.Name.Equals(model.Name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException("Category must contain unique name.");
        }
    }
}
