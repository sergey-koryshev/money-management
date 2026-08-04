namespace MCP.Adapters;

using AutoMapper;
using Backend.Service.Actions;
using MCP.DTO;

public class McpAdapter : IMcpAdapter
{
    private readonly IMapper mapper;
    private readonly IActionFactory actionFactory;

    public McpAdapter(IMapper mapper, IActionFactory actionFactory)
    {
        this.mapper = mapper;
        this.actionFactory = actionFactory;
    }

    public List<CurrencyMcpDto> GetCurrencies()
    {
        var currencies = this.actionFactory.Create<GetCurrenciesAction, List<Backend.Domain.Models.Currency>>().Execute();
        return currencies.Select(c => this.mapper.Map<CurrencyMcpDto>(c)).ToList();
    }

    public List<string> GetCategoryNames()
    {
        var categories = this.actionFactory.Create<GetUniqueCategoryNamesAction, List<string>>().Execute();
        return categories;
    }

    public List<ConnectionMcpDto> GetAcceptedConnections()
    {
        var connections = this.actionFactory.Create<GetAcceptedConnectionsAction, List<Backend.Domain.Models.Connection>>().Execute();
        return connections.Select(c => this.mapper.Map<ConnectionMcpDto>(c)).ToList();
    }

    public List<ExpenseMcpDto> GetExpenses(Models.ExpensesFilter filter)
    {
        var filterModel = this.mapper.Map<Backend.Domain.Models.ExpensesFilter>(filter);
        filterModel.TimeZone ??= TimeZoneInfo.Local.Id; // hardcoded to server's time zone if missed, need to read it from user preferences.
        var expenses = this.actionFactory.Create<GetExpensesAction, List<Backend.Domain.Models.Expense>>(filterModel).Execute();
        return expenses.Select(e => this.mapper.Map<ExpenseMcpDto>(e)).ToList();
    }
}