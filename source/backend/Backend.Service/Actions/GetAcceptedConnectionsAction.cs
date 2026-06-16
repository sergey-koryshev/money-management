using Backend.Application;
using Backend.Domain.Models;
using Backend.Infrastructure;

namespace Backend.Service.Actions;

public class GetAcceptedConnectionsAction : ActionBase<List<Connection>>
{
    public GetAcceptedConnectionsAction()
    {
    }

    protected override List<Connection> ExecuteInternal(AppDbContext dbContext, Domain.Entities.Person identity)
    {
        var result = new ConnectionsRepository(dbContext, identity).GetAcceptedConnections();
        return result;
    }
}