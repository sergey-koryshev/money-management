namespace MCP.Tools;

using System.ComponentModel;
using MCP.Adapters;
using MCP.DTO;
using ModelContextProtocol.Server;

[McpServerToolType]
public class ConnectionsTools
{
    private readonly IMcpAdapter adapter;

    public ConnectionsTools(IMcpAdapter mcpAdapter)
    {
        this.adapter = mcpAdapter;
    }

    [McpServerTool(Name = "get_accepted_connections"), Description("Gets a list of accepted connections.")]
    public List<ConnectionMcpDto> GetAcceptedConnections()
    {
        return this.adapter.GetAcceptedConnections();
    }
}