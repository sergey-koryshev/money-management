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
            .ForMember(d => d.Status, o => o.MapFrom(this.MapConnectionStatus))
            .ForMember(d => d.Person, o => o.MapFrom(this.MapConnectionPerson));
        CreateMap<Expense, ExpenseDto>()
            .ForMember(d => d.PermittedPersons, o => o.MapFrom(this.MapExpensePermittedPersons));
        CreateMap<Price, PriceDto>();
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
        if (!context.TryGetItems(out var items) || (!items.ContainsKey("IncludePersonDetails") && !items.ContainsKey("ConnectedPersonsIds")))
        {
            throw new AutoMapperMappingException("'IncludePersonDetails' or 'ConnectedPersonsIds' in resolution context are required to map Person to AmbiguousPersonDto");
        }
        
        bool includeDetails = false;

        if (items.TryGetValue("IncludePersonDetails", out var includePersonDetailsItem) && includePersonDetailsItem is bool includePersonDetails)
        {
            includeDetails = includePersonDetails;
        }
        else if (items.TryGetValue("ConnectedPersonsIds", out var connectedPersonsIdsItem) && connectedPersonsIdsItem is HashSet<int> connectedPersonsIds)
        {
            includeDetails = connectedPersonsIds.Contains(src.Id);
        }

        return includeDetails ? mapFunc(src) : null;
    }

    private List<Person> MapExpensePermittedPersons(Expense src, ExpenseDto _, List<AmbiguousPersonDto> __, ResolutionContext context)
    {
        if (context.TryGetItems(out var items) && items.TryGetValue("Identity", out var item) && item is Entities.Person identity)
        {
            if (src.CreatedBy.Id == identity.Id)
            {
                return src.PermittedPersons.Where(p => p.Id != identity.Id).ToList();
            }
            else
            {
                return new List<Person>();
            }
        }

        throw new AutoMapperMappingException("'Identity' in resolution context is required to map Expense to ExpenseDto");
    }
}