namespace Backend.Service;

using AutoMapper;
using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

public abstract class ServiseBase
{
    protected Person? Identity { get; }

    protected IMapper Mapper { get; }

    protected IDbContextFactory<AppDbContext> DbContextFactory { get; }

    public ServiseBase(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory)
    {
        if (httpContextAccessor.HttpContext.Items.TryGetValue("__identity", out var user))
        {
            this.Identity = user as Person;
        }

        this.Mapper = mapper;
        this.DbContextFactory = dbContextFactory;
    }

    protected void ValidateUserIdentity()
    {
        if (this.Identity == null)
        {
            throw new UnauthorizedAccessException("Action is not authorized.");
        }
    }

    protected void ExecuteActionInTransaction(Action<AppDbContext> action, bool authRequired = true) =>
        this.ExecuteActionInTransaction<int>((dbContext) =>
        {
            action(dbContext);
            return 0;
        }, authRequired);
        
    protected T ExecuteActionInTransaction<T>(Func<AppDbContext, T> func, bool authRequired = true)
    {
        using (var dbContext = this.DbContextFactory.CreateDbContext())
        {
            if (authRequired)
            {
                this.ValidateUserIdentity();
            }

            dbContext.Database.BeginTransaction();
            var result = func(dbContext);
            dbContext.Database.CommitTransaction();

            return result;
        }
    }
}
