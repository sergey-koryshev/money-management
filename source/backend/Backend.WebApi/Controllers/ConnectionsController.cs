namespace Backend.WebApi;

using Backend.Service;
using Backend.WebApi.Results;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class ConnectionsController
{
    private readonly IConnectionsService connectionsService;

    public ConnectionsController(IConnectionsService connectionsService)
    {
        this.connectionsService = connectionsService;
    }

    [HttpGet]
    [Route("pendingConnectionRequestsAmount")]
    public IActionResult GetPendingConnectionRequestsAmount()
    {
        var result = this.connectionsService.GetPendingConnectionRequestsAmount();
        return new AppActionResult(result);
    }

    [HttpGet]
    public IActionResult GetAllConnections()
    {
        var result = this.connectionsService.GetAllConnections();
        return new AppActionResult(result);
    }

    [HttpPost]
    [Route("{connectionId}/accept")]
    public IActionResult AcceptConnectionRequest(int connectionId)
    {
        var result = this.connectionsService.AcceptConnectionRequest(connectionId);
        return new AppActionResult(result);
    }

    [HttpDelete]
    [Route("{connectionId}")]
    public IActionResult DeleteConnection(int connectionId)
    {
        this.connectionsService.DeleteConnection(connectionId);
        return new AppActionResult();
    }

    [HttpPost]
    public IActionResult CreateConnectionRequest([FromBody] int personId)
    {
        var result = this.connectionsService.CreateConnectionRequest(personId);
        return new AppActionResult(result);
    }
}
