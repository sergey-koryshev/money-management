namespace MCP.DTO;

using AutoMapper;
using Backend.Domain.Models;

public class Mapper : Profile
{
    public Mapper()
    {
        CreateMap<Currency, CurrencyMcpDto>()
            .ForMember(d => d.Name, o => o.MapFrom(s => s.FriendlyName));
        
        CreateMap<Failure,FailureMcpDto>();

        CreateMap<Category, CategoryMcpDto>();

        CreateMap<Price, PriceMcpDto>();

        // TODO: implement logic to hide name if it's restricted to current user
        CreateMap<Person, PersonMcpDto>();

        CreateMap<Models.ExpensesFilter, Backend.Domain.Models.ExpensesFilter>();

        CreateMap<Connection, ConnectionMcpDto>();

        CreateMap<Expense, ExpenseMcpDto>();
    }
}