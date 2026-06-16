namespace MCP.Tools;

using System.ComponentModel;
using MCP.Adapters;
using MCP.DTO;
using ModelContextProtocol.Server;

[McpServerToolType]
public class CurrenciesTools
{
    private readonly IMcpAdapter adapter;

    public CurrenciesTools(IMcpAdapter mcpAdapter)
    {
        this.adapter = mcpAdapter;
    }

    [McpServerTool(Name = "get_currencies"), Description("Gets a list of available currencies.")]
    public List<CurrencyMcpDto> GetCurrencies()
    {
        return this.adapter.GetCurrencies();
    }
}
