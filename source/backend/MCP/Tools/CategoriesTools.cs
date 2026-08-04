namespace MCP.Tools;

using System.ComponentModel;
using MCP.Adapters;
using ModelContextProtocol.Server;

[McpServerToolType]
public class CategoriesTools
{
    private readonly IMcpAdapter adapter;

    public CategoriesTools(IMcpAdapter mcpAdapter)
    {
        this.adapter = mcpAdapter;
    }

    [McpServerTool(Name = "get_category_names"), Description("Gets a list of unique category names available for user.")]
    public List<string> GetCategoryNames()
    {
        return this.adapter.GetCategoryNames();
    }
}