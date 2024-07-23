namespace Backend.Application;

using Backend.Domain.Models;
using Backend.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Entities = Domain.Entities;

public class ConnectionsRepository
{
    private readonly AppDbContext dbContext;

    private readonly Entities.Person identity;

    public ConnectionsRepository(AppDbContext dbContext, Entities.Person identity)
    {
        this.dbContext = dbContext;
        this.identity = identity;
    }

    public List<Connection> GetAllConnections()
    {
        return this.GetConnectionsQuery().Select(c => c.ToModel(this.identity)).ToList();
    }

    public int GetPendingConnectionRequestsAmount()
    {
        return this.GetConnectionsQuery().Where(c => c.TargetPersonId == this.identity.Id && !c.IsAccepted).Count();
    }

    public Connection CreateConnectionRequest(int personId)
    {
        if (this.identity.Id == personId)
        {
            throw new InvalidOperationException("You cannot create connection with yourself.");
        }

        var existingConnection = this.GetConnectionsQuery().FirstOrDefault(c => c.TargetPersonId == personId);

        if (existingConnection != null)
        {
            throw new InvalidOperationException($"You are already connected with the user with id '{personId}'.");
        }

        var connectionEntity = new Entities.Connection
        {
            RequestingPersonId = this.identity.Id,
            TargetPersonId = personId,
            IsAccepted = false,
            RequestedOn = DateTime.UtcNow
        };

        this.dbContext.Connections.Add(connectionEntity);
        this.dbContext.SaveChanges();

        return connectionEntity.ToModel(this.identity);
    }

    public void DeleteConnection(int connectionId)
    {
        var deletingConnection = this.FindConnection(connectionId);

        this.dbContext.Connections.Remove(deletingConnection);
        this.dbContext.SaveChanges();
    }

    public Connection AcceptConnectionRequest(int connectionId)
    {
        var acceptingConnection = this.FindConnection(connectionId);

        if (acceptingConnection.IsAccepted)
        {
            throw new InvalidOperationException($"Connection request with id '{connectionId}' has been already accepted.");
        }

        if (acceptingConnection.TargetPersonId != this.identity.Id)
        {
            throw new InvalidOperationException($"You doesn't have permissions to accept this connection request.");
        }

        acceptingConnection.IsAccepted = true;
        acceptingConnection.AcceptedOn = DateTime.UtcNow;
        this.dbContext.SaveChanges();

        return acceptingConnection.ToModel(this.identity);
    }

    private IQueryable<Entities.Connection> GetConnectionsQuery()
    {
        return this.dbContext.Connections
            .Include(c => c.RequestingPerson)
            .Include(c => c.TargetPerson)
            .Where(c => c.RequestingPersonId == this.identity.Id || c.TargetPersonId == this.identity.Id);
    }

    private Entities.Connection FindConnection(int connectionId)
    {
        var connection = this.GetConnectionsQuery().FirstOrDefault(c => c.Id == connectionId)
            ?? throw new InvalidOperationException($"Connection with id '{connectionId}' doesn't exist.");
        return connection;
    }
}
