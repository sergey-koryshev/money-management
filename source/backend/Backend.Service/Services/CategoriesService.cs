namespace Backend.Service;

using Backend.Domain.DTO;
using Backend.Domain.Entities;
using Microsoft.AspNetCore.Http;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Backend.Infrastructure;
using Backend.Application;

public class CategoriesService : ICategoriesService
{
    private readonly Person? identity;
    private readonly IMapper mapper;
    private readonly IDbContextFactory<AppDbContext> dbContextFactory;
    
    public CategoriesService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory)
    {
        if (httpContextAccessor.HttpContext.Items.TryGetValue("__identity", out var user))
        {
            this.identity = user as Person;
        }

        this.mapper = mapper;
        this.dbContextFactory = dbContextFactory;
    }

    public List<CategoryDto> GetAllCategories()
    {
        this.ValidateUserIdentity();
        var result = new CategoriesRepository(this.dbContextFactory.CreateDbContext(), this.identity!).GetAllCategories();
        return result.Select(c => this.mapper.Map<CategoryDto>(c)).ToList();
    }

    private void ValidateUserIdentity()
    {
        if (this.identity == null)
        {
            throw new Exception("Action is not authorized.");
        }
    }
}
