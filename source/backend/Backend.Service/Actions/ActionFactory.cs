namespace Backend.Service.Actions;

using Microsoft.Extensions.DependencyInjection;

public class ActionFactory : IActionFactory
{
    private readonly IServiceProvider serviceProvider;

    public ActionFactory(IServiceProvider serviceProvider)
    {
        this.serviceProvider = serviceProvider;
    }

    public TAction Create<TAction, TResult>() where TAction : ActionBase<TResult>
    {
        return this.Create<TAction, TResult>(Array.Empty<object>());
    }

    public TAction Create<TAction, TResult>(params object[] arguments) where TAction : ActionBase<TResult>
    {
        var action = ActivatorUtilities.CreateInstance<TAction>(this.serviceProvider, arguments);
        action.Initialize(this.serviceProvider);
        return action;
    }
}