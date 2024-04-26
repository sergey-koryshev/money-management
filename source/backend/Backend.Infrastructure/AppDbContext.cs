namespace Backend.Infrastructure;

using Backend.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityUserContext<User, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    {
        Database.EnsureCreated();
    }
}