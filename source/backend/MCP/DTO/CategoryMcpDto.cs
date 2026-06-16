namespace MCP.DTO;

using System.ComponentModel;

[Description("Represents a category of expenses.")]
public class CategoryMcpDto
{
    [Description("The unique identifier of the category.")]
    public int Id { get; set; }

    [Description("The name of the category.")]
    public required string Name { get; set; }

    [Description("The person who created the category.")]
    public required PersonMcpDto CreatedBy { get; set; }

}