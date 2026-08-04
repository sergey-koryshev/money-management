namespace MCP.DTO;

using System.ComponentModel;

[Description("Represents a person who can be associated with expenses or connections.")]
public class PersonMcpDto
{
    [Description("The unique identifier of the person.")]
    public int Id { get; set; }

    [Description("The first name of the person. May be empty if the current user can't see it.")]
    public string? FirstName { get; set; }

    [Description("The second name of the person. May be empty if the current user can't see it.")]
    public string? SecondName { get; set; }
}