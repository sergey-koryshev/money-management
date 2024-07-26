namespace Backend.Service.Mappers;

using AutoMapper;
using Backend.Domain.DTO;
using Backend.Domain.Models;
using Entities = Domain.Entities;

public class AppMapper : Profile
{
    public AppMapper()
    {
        CreateMap<Person, PersonDto>();
        CreateMap<Category, CategoryDto>();
        CreateMap<Currency, CurrencyDto>();
        CreateMap<Person, AmbiguousPersonDto>()
            .ForMember(d => d.FirstName, o => o.MapFrom((src, dest, obj, context) => this.MapPersonDetails(src, dest, obj, context, (person) => person.FirstName)))
            .ForMember(d => d.SecondName, o => o.MapFrom((src, dest, obj, context) => this.MapPersonDetails(src, dest, obj, context, (person) => person.SecondName)))
            .ForMember(d => d.Tenant, o => o.MapFrom((src, dest, obj, context) => this.MapPersonDetails(src, dest, obj, context, (person) => person.Tenant)));
        CreateMap<Connection, ConnectionDto>()
            .ForMember(d => d.Status, o => o.MapFrom((src, dest, obj, context) => this.MapConnectionStatus(src, dest, obj, context)))
            .ForMember(d => d.Person, o => o.MapFrom((src, dest, obj, context) => this.MapConnectionPerson(src, dest, obj, context)));
    }

  private ConnectionStatus MapConnectionStatus(Connection src, ConnectionDto _, ConnectionStatus __, ResolutionContext context)
  {
        if (context.TryGetItems(out var items) && items.TryGetValue("Identity", out var item) && item is Entities.Person identity)
        {
            return src.IsAccepted
                ? ConnectionStatus.Accepted
                : src.TargetPerson.Id == identity.Id
                    ? ConnectionStatus.Pending
                    : ConnectionStatus.PendingOnTarget;
        }

        throw new AutoMapperMappingException("'Identity' in resolution context is required to map Connection to ConnectionDto");
  }

  private Person MapConnectionPerson(Connection src, ConnectionDto _, AmbiguousPersonDto __, ResolutionContext context)
  {
        if (context.TryGetItems(out var items) && items.TryGetValue("Identity", out var item) && item is Entities.Person identity)
        {
            items["IncludePersonDetails"] = src.IsAccepted || src.TargetPerson.Id == identity.Id;

            return src.RequestingPerson.Id == identity.Id
                ? src.TargetPerson
                : src.RequestingPerson;
        }

        throw new AutoMapperMappingException("'Identity' in resolution context is required to map Connection to ConnectionDto");
  }

  private object? MapPersonDetails(Person src, AmbiguousPersonDto _, object? __, ResolutionContext context, Func<Person, object?> mapFunc)
    {
        if (context.TryGetItems(out var items) && items.TryGetValue("IncludePersonDetails", out var item) && item is bool includePersonDetails)
        {
            return includePersonDetails ? mapFunc(src) : null;
        }

        throw new AutoMapperMappingException("'IncludePersonDetails' in resolution context is required to map Person to AmbiguousPersonDto");
    }
}