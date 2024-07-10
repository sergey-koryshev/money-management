using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.WebApi;

public class RequestUserIdentityMiddleware
{
    private readonly RequestDelegate next;

    public RequestUserIdentityMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task InvokeAsync(HttpContext context, UserManager<User> userManager, IDbContextFactory<AppDbContext> dbContextFactory)
    {
        if (context.User.Identity?.IsAuthenticated == true) {
            var stringifiedPersonId = userManager.GetUserId(context.User);

            if (stringifiedPersonId != null && int.TryParse(stringifiedPersonId, out var personId))
            {
                using (var dbContext = dbContextFactory.CreateDbContext())
                {
                    var person = dbContext.Persons.Find(personId);
                    context.Items.Add("__identity", person);
                }
            }
        }

        await this.next(context);
    }
}
