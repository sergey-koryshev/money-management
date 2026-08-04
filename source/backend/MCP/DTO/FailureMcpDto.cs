namespace MCP.DTO;

using System.ComponentModel;
using Backend.Domain.Models;

[Description("Represents a failure that occurred during an operation.")]
public class FailureMcpDto
{
    [Description("The type of the failure.")]
    public required FailureType Type { get; set; }

    [Description("The message describing the failure.")]
    public required string Message { get; set; }
}