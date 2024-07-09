namespace Backend.Domain.Models;

public static class MapperExtensions
{
    public static Category ToModel(this Entities.Category entity)
    {
        return new Category
        {
            Id = entity.Id,
            Name = entity.Name,
            CreatedBy = entity.CreatedBy?.ToModel(),
            PermittedPersons = entity.PermittedPersons.Select(p => p.ToModel()).ToList()
        };
    }

    public static Person ToModel(this Entities.Person entity)
    {
        return new Person
        {
            Id = entity.Id,
            FirstName = entity.FirstName,
            SecondName = entity.SecondName,
            Tenant = entity.Tenant,
        };
    }
}