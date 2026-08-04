namespace MCP.DTO;

using System.ComponentModel;

[Description("Represents an expense. May contain converted price into another currency.")]
public class ExpenseMcpDto
{
    [Description("The unique identifier of the currency.")]
    public int Id { get; set; }

    [Description("The date of the expense.")]
    public DateTime Date { get; set; }

    [Description("The name of the expense.")]
    public required string Name { get; set; }

    [Description("The description of the expense.")]
    public string? Description { get; set; }

    [Description("The category of the expense.")]
    public CategoryMcpDto? Category { get; set; }

    [Description("The price of the expense. May contain converted price into another currency.")]
    public required PriceMcpDto Price { get; set; }

    [Description("The original price of the expense. Empty if the price was not converted into another currency.")]
    public PriceMcpDto? OriginalPrice { get; set; }

    [Description("The person who created the expense.")]
    public required PersonMcpDto CreatedBy { get; set; }

    [Description("The list of persons who are permitted to view the expense.")]
    public List<PersonMcpDto> PermittedPersons { get; set; } = new List<PersonMcpDto>();
}