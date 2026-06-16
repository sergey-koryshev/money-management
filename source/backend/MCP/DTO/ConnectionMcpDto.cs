namespace MCP.DTO;

using System.ComponentModel;
using Backend.Domain.Models;

[Description("Represents a connection between two people. Connected people can share expenses with each other.")]
public class ConnectionMcpDto
{
    [Description("The type of connection, indicating whether it's incoming or outgoing.")]
    public required ConnectionType Type { get; set; }

    [Description("The target person of the connection. If the connection is outgoing, this is the person to whom the connection request was sent. If the connection is incoming, this is the person who sent the connection request.")]
    public required PersonMcpDto TargetPerson { get; set; }

    [Description("Indicates whether the connection request has been accepted.")]
    public bool IsAccepted { get; set; }

    [Description("The date and time when the connection request was made.")]
    public DateTime RequestedOn { get; set; }

    [Description("The date and time when the connection was accepted, null means not accepted yet.")]
    public DateTime? AcceptedOn { get; set; }
}