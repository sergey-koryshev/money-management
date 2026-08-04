namespace MCP.Tools;

using System.ComponentModel;
using MCP.Adapters;
using MCP.DTO;
using MCP.Models;
using ModelContextProtocol.Server;

[McpServerToolType]
public class ExpensesTools
{
    private readonly IMcpAdapter adapter;

    public ExpensesTools(IMcpAdapter mcpAdapter)
    {
        this.adapter = mcpAdapter;
    }
    
    [McpServerTool, Description("Gets a list of expenses filtered by criteria. At least one filter criteria should be provided.")]
    public List<ExpenseMcpDto> GetExpenses(ExpensesFilter filter)
    {
        return this.adapter.GetExpenses(filter);
    }
}
