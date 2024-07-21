namespace Backend.Tests;

using AutoMapper;
using Backend.Infrastructure;
using Backend.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

public class ServiceTest : ServiseBase
{
    public ServiceTest(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory) : base(httpContextAccessor, mapper, dbContextFactory) {}

    public virtual void ServiceTestMethod(Action<AppDbContext> action, bool authRequired = true) => this.ExecuteActionInTransaction(action, authRequired);
}
