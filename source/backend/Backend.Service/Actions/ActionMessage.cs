namespace Backend.Service.Actions;

using System.Collections;
using System.Text;

public class ActionMessage
{
    public StringBuilder message { get; } = new StringBuilder();

    public static ActionMessage Create() => new ActionMessage();
}

public static class ActionMessageExtensions
{
    private const string EmptyValue = "null";
    private const string LineTemplate = "- {0}: {1}";

    public static ActionMessage Add(this ActionMessage actionMessage, string name, string? value)
    {
        actionMessage.message.AppendLine(string.Format(LineTemplate, name, value ?? EmptyValue));
        return actionMessage;
    }

    public static ActionMessage Add(this ActionMessage actionMessage, string name, int? value)
    {
        actionMessage.message.AppendLine(string.Format(LineTemplate, name, value?.ToString() ?? EmptyValue));
        return actionMessage;
    }

    public static ActionMessage Add(this ActionMessage actionMessage, string name, DateTime? value)
    {
        actionMessage.message.AppendLine(string.Format(LineTemplate, name, value?.ToString() ?? EmptyValue));
        return actionMessage;
    }

    public static ActionMessage Add(this ActionMessage actionMessage, string name, IEnumerable? values)
    {
        var valueString = values != null ? string.Join(", ", values.Cast<object>()) : EmptyValue;
        actionMessage.message.AppendLine(string.Format(LineTemplate, name, valueString));
        return actionMessage;
    }

    public static ActionMessage Add(this ActionMessage actionMessage, string name, bool? value)
    {
        actionMessage.message.AppendLine(string.Format(LineTemplate, name, value?.ToString() ?? EmptyValue));
        return actionMessage;
    }
}