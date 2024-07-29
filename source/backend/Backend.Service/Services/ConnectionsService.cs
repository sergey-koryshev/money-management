using AutoMapper;
using Backend.Application;
using Backend.Domain.DTO;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Backend.Service;

public class ConnectionsService : ServiseBase, IConnectionsService
{
    public ConnectionsService(IHttpContextAccessor httpContextAccessor, IMapper mapper, IDbContextFactory<AppDbContext> dbContextFactory) : base(httpContextAccessor, mapper, dbContextFactory) {}

    public ConnectionDto AcceptConnectionRequest(int connectionId)
    {
        return this.ExecuteActionInTransaction(dbContext => {
            var result = new ConnectionsRepository(dbContext, this.Identity!).AcceptConnectionRequest(connectionId);
            return this.Mapper.Map<ConnectionDto>(result, o => o.Items["Identity"] = this.Identity);
        });
    }

    public ConnectionDto CreateConnectionRequest(int personId)
    {
        return this.ExecuteActionInTransaction(dbContext => {
            var result = new ConnectionsRepository(dbContext, this.Identity!).CreateConnectionRequest(personId);
            return this.Mapper.Map<ConnectionDto>(result, o => o.Items["Identity"] = this.Identity);
        });
    }

    public void DeleteConnection(int connectionId)
    {
        this.ExecuteActionInTransaction(dbContext => {
            new ConnectionsRepository(dbContext, this.Identity!).DeleteConnection(connectionId);
        });
    }

    public List<ConnectionDto> GetAllConnections()
    {
        return this.ExecuteActionInTransaction(dbContext => {
            var result = new ConnectionsRepository(dbContext, this.Identity!).GetAllConnections();
            return result.Select(c => this.Mapper.Map<ConnectionDto>(c, o => o.Items["Identity"] = this.Identity)).ToList();
        });
    }

    public int GetPendingConnectionRequestsAmount()
    {
        return this.ExecuteActionInTransaction(dbContext => {
            return new ConnectionsRepository(dbContext, this.Identity!).GetPendingConnectionRequestsAmount();
        });
    }
}
