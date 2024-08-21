namespace Backend.Service;

using Backend.Domain.DTO;
using Microsoft.AspNetCore.Http;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Backend.Infrastructure;
using Backend.Application;

public class CategoriesService : ServiseBase, ICategoriesService
{
    public CategoriesService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory) : base(httpContextAccessor, mapper, dbContextFactory) {}

    public List<string> GetUniqueCategoryNames()
    {
        return this.ExecuteActionInTransaction((dbContext) =>
        {
            return new CategoriesRepository(dbContext, this.Identity!).GetUniqueCategoryNames().ToList();
        });
    }
}
