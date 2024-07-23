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

    public static AmbiguousPerson ToModel(this Entities.Person entity, bool includeUserDetails)
    {
        var person = new AmbiguousPerson()
        {
            Id = entity.Id,
        };

        if (includeUserDetails)
        {
            person.FirstName = entity.FirstName;
            person.SecondName = entity.SecondName;
            person.Tenant = entity.Tenant;
        }

        return person;
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

    public static Connection ToModel(this Entities.Connection entity, Entities.Person identity)
    {
        var status = entity.IsAccepted
            ? ConnectionStatus.Accepted
            : entity.TargetPersonId == identity.Id
                ? ConnectionStatus.Pending
                : ConnectionStatus.PendingOnTarget;

        var person = entity.RequestingPersonId == identity.Id
            ? entity.TargetPerson
            : entity.RequestingPerson;

        return new Connection
        {
            Id = entity.Id,
            Status = status,
            Person = person!.ToModel(status == ConnectionStatus.Accepted || status == ConnectionStatus.Pending)
        };
    }
}