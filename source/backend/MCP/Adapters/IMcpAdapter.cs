namespace MCP.Adapters;

using MCP.DTO;

public interface IMcpAdapter
{
    List<CurrencyMcpDto> GetCurrencies();

    List<string> GetCategoryNames();

    List<ConnectionMcpDto> GetAcceptedConnections();

    List<ExpenseMcpDto> GetExpenses(Models.ExpensesFilter filter);
}
