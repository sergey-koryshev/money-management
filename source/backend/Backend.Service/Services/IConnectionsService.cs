namespace Backend.Service;

using Backend.Domain.DTO;

public interface IConnectionsService
{
    public int GetPendingConnectionRequestsAmount();

    public List<ConnectionDto> GetAllConnections();

    public ConnectionDto CreateConnectionRequest(int targetPersonId);

    public ConnectionDto AcceptConnectionRequest(int connectionId);

    public void DeleteConnection(int connectionId);
}
