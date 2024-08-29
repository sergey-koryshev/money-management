namespace Backend.Application;

using Backend.Domain.Extensions;
using Backend.Domain.Models;
using Backend.Domain.Models.Mappers;
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

    public List<string> GetUniqueCategoryNames()
    {
        return this.GetCategoriesQuery().Select(c => c.Name!).Distinct().ToList();
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

    /// <summary>
    /// Adds persons to permitted persons list.
    /// </summary>
    /// <param name="entity">The category entity.</param>
    /// <param name="personsIdsToAdd">The list of persons ids to grant permissions for.</param>
    /// <remarks>
    /// The method also check that creator is in permitted list.
    /// </remarks>
    internal void UpdatePermittedPersonsList(Entities.Category entity, HashSet<int> personsIdsToAdd)
    {
        if (entity.CreatedById != this.identity.Id)
        {
            throw new InvalidOperationException($"You don't have permissions to grand access to the category with id '{entity.Id}'");
        }

        // get existing permittees
        var permittedPersonsIds = entity.PermittedPersons.Select(p => p.Id).ToHashSet();

        // ensure that creator is in the permitted persons list
        if (!permittedPersonsIds.Contains(entity.CreatedById))
        {
            permittedPersonsIds.Add(entity.CreatedById);
        }

        // adding desired persons
        if (!personsIdsToAdd.IsEmpty())
        {
            foreach (var id in personsIdsToAdd)
            {
                permittedPersonsIds.Add(id);
            }
        }

        // put final list of persons to entity's permitted persons list
        var permittedPersons = this.dbContext.Persons.Where(p => permittedPersonsIds.Contains(p.Id)).ToList();
        entity.PermittedPersons = permittedPersons;
    }

    internal void UpdatePermittedPersonsList(int categoryId, HashSet<int> personsIdsToAdd)
    {
        var entity = this.GeCategoryEntityById(categoryId);
        this.UpdatePermittedPersonsList(entity, personsIdsToAdd);
    }

    internal IQueryable<Entities.Category> GetCategoriesQuery(bool includePermittedPersons = false) {
        var query = this.dbContext.Categories
            .Include(c => c.CreatedBy)
            .AsQueryable();

        if (includePermittedPersons)
        {
            query = query.Include(c => c.PermittedPersons);
        }
        
        return query.Where(c => c.PermittedPersons.Any(p => p.Id == this.identity.Id));
    }

    private void UpdateEntity(Entities.Category entity, Category model)
    {
        entity.Name = model.Name;

        if (entity.Id == 0)
        {
            entity.CreatedById = this.identity.Id;
        }

        this.UpdatePermittedPersonsList(entity, model.PermittedPersons.Select(p => p.Id).ToHashSet());
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
            throw new InvalidOperationException($"Category cannot be created on behalf of another user.");
        }

        var permittedPersonsIds = model.PermittedPersons.Select(p => p.Id).ToHashSet();
        var existingPermittedPersonsIds = this.dbContext.Persons.Where(p => permittedPersonsIds.Contains(p.Id)).Select(p => p.Id).ToHashSet();

        if (permittedPersonsIds.Count > existingPermittedPersonsIds.Count)
        {
            var notExistingPersonIds = permittedPersonsIds.Where(id => !existingPermittedPersonsIds.Contains(id)).ToList();
            throw new InvalidOperationException(string.Format("Users with IDs '{0}' don't exist and cannot be associated with the category.", string.Join(", ", notExistingPersonIds)));
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

    private Entities.Category GeCategoryEntityById(int id)
    {
        var entity = this.GetCategoriesQuery(true).FirstOrDefault(e => e.Id == id);

        if (entity == null)
        {
            throw new InvalidOperationException($"Category with id '{id}' doesn't exist.");
        }

        return entity;
    }
}
