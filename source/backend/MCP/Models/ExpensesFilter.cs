namespace MCP.Models;

using System.ComponentModel;

[Description("Represents the filter criteria for retrieving expenses.")]
public class ExpensesFilter
{
    [Description("The month for which to retrieve expenses.")]
    public int? Month { get; set; }

    [Description("The year for which to retrieve expenses.")]
    public int? Year { get; set; }

    [Description("The search term to filter a list of expenses.")]
    public string? SearchingTerm { get; set; }

    [Description("The ID of the user who created the expenses.")]
    public int? CreatedById { get; set; }

    [Description("Indicates whether to retrieve only shared or not-shared expenses.")]
    public bool? Shared { get; set; }

    [Description("The list of category names for which to retrieve expenses.")]
    public List<string?>? CategoryName { get; set; }

    [Description("The list of expense names for which to retrieve expenses.")]
    public List<string>? Name { get; set; }

    [Description("The list of currency IDs for which to retrieve expenses.")]
    public List<int>? CurrencyId { get ; set; }
}
