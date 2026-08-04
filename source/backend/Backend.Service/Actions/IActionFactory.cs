namespace Backend.Service.Actions;

public interface IActionFactory
{
    TAction Create<TAction, TResult>() where TAction : ActionBase<TResult>;

    TAction Create<TAction, TResult>(params object[] arguments) where TAction : ActionBase<TResult>;
}
