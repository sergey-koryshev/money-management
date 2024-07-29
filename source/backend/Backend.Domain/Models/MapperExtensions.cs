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

    public static Currency ToModel(this Entities.Currency entity)
    {
        return new Currency
        {
            Id = entity.Id,
            Name = entity.Name,
            FriendlyName = entity.FriendlyName,
            FlagCode = entity.FlagCode,
            Sign = entity.Sign,
        };
    }

    public static Connection ToModel(this Entities.Connection entity)
    {
        if (entity.RequestingPerson == null)
        {
            throw new InvalidOperationException("Property RequestingPerson is required to convert Connection entity to model");
        }

        if (entity.TargetPerson == null)
        {
            throw new InvalidOperationException("Property TargetPerson is required to convert Connection entity to model");
        }

        return new Connection
        {
            Id = entity.Id,
            RequestingPerson = entity.RequestingPerson.ToModel(),
            TargetPerson = entity.TargetPerson.ToModel(),
            IsAccepted = entity.IsAccepted,
            RequestedOn = entity.RequestedOn,
            AcceptedOn = entity.AcceptedOn
        };
    }
}