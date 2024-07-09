namespace Backend.Service.Mappers;

using AutoMapper;
using Backend.Domain.DTO;
using Backend.Domain.Models;

public class Mapper : Profile
{
    public Mapper()
    {
        CreateMap<Person, PersonDto>();
        CreateMap<Category, CategoryDto>();
    }
}