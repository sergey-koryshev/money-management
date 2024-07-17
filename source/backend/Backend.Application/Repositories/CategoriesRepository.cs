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
        this.dbContext.Categories.Add(newEntity);
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

        var creator = this.dbContext.Persons.Find(model.CreatedBy.Id);

        if (creator == null)
        {
            throw new InvalidOperationException($"User with id '{model.CreatedBy.Id}' doesn't exist and cannot be set as creator.");
        }

        if (model.Id == 0 && model.CreatedBy.Id != this.identity.Id)
        {
            throw new InvalidOperationException($"You cannot create the category on behalf of another user.");
        }

        if (model.Id == 0 && !model.PermittedPersons.Any(p => p.Id == model.CreatedBy.Id))
        {
            model.PermittedPersons.Add(model.CreatedBy);
        }

        if (string.IsNullOrWhiteSpace(model.Name))
        {
            throw new InvalidOperationException("Name cannot be empty.");
        }

        var existingCategory = this.dbContext.Categories.FirstOrDefault(c => c.CreatedById == model.CreatedBy.Id && c.Name != null && c.Name.ToLower().Equals(model.Name.ToLower()));

        if (existingCategory != null)
        {
            throw new InvalidOperationException("Category must contain unique name.");
        }
    }
}
