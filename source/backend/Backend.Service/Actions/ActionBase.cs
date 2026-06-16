namespace Backend.Service.Actions;

using System.Diagnostics;
using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public abstract class ActionBase<T>
{
    private Person? Identity { get; set; }

    private AppDbContext? DbContext { get; set; }

    private ILogger<ActionBase<T>>? Logger { get; set; }

    protected abstract T ExecuteInternal(AppDbContext dbContext, Person identity);

    protected virtual ActionMessage GetMessage()
    {
        return ActionMessage.Create();
    }

    internal void Initialize(IServiceProvider serviceProvider)
    {
        this.DbContext = serviceProvider.GetRequiredService<AppDbContext>();
        this.Identity = serviceProvider.GetService<Person>();
        this.Logger = serviceProvider.GetRequiredService<ILogger<ActionBase<T>>>();
    }

    public T Execute()
    {
        if (this.DbContext == null)
        {
            throw new InvalidOperationException("DbContext is not initialized.");
        }

        if (this.Identity == null)
        {
            throw new UnauthorizedAccessException();
        }

        var watch = Stopwatch.StartNew();

        try
        {
            var message = this.GetMessage();
            this.Logger?.LogInformation("Executing action {0} for user {1}.{2}", this.GetType().Name, this.Identity.Id, message.message.Length == 0 ? string.Empty : $"\n{message.message}");
            this.DbContext.Database.BeginTransaction();
            var result = this.ExecuteInternal(this.DbContext, this.Identity);
            this.DbContext.Database.CommitTransaction();
            return result;
        }
        catch
        {
            this.DbContext.Database.RollbackTransaction();
            this.Logger?.LogError("Error occurred while executing action {0}.", this.GetType().Name);
            throw;
        }
        finally
        {
            watch.Stop();
            var elapsedMs = watch.ElapsedMilliseconds;
            this.Logger?.LogInformation("Finished executing action {0}. Elapsed time: {1} ms.", this.GetType().Name, elapsedMs);
        }
    }
}