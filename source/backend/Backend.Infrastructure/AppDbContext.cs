namespace Backend.Infrastructure;

using Backend.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityUserContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
    {
        Database.EnsureCreated();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>().HasData(
            new User
            {
                Id = Guid.NewGuid().ToString(),
                FirstName = "User",
                SecondName = "1",
                UserName = "user1@test.com",
                NormalizedUserName = "user1@test.com".ToUpper(),
                Email = "user1@test.com",
                NormalizedEmail = "user1@test.com".ToUpper(),
                PasswordHash = "AQAAAAIAAYagAAAAEGKSJpyLst59yBAmt6MXHpND7AhwsDUg4SvlCpkJWRTYcVnz0y1IowRarAAcqh56Dw==",
                SecurityStamp = "CMUFAZEZFW52LZORGCWV3KDELEEJ2K5J",
                ConcurrencyStamp = "c824a837-3d13-4ffa-9d6f-c9968047e698",
                LockoutEnd = null,
                LockoutEnabled = true,
                AccessFailedCount = 0
            },
            new User
            {
                Id = Guid.NewGuid().ToString(),
                FirstName = "User",
                SecondName = "2",
                UserName = "user2@test.com",
                NormalizedUserName = "user2@test.com".ToUpper(),
                Email = "user2@test.com",
                NormalizedEmail = "user2@test.com".ToUpper(),
                PasswordHash = "AQAAAAIAAYagAAAAEAuVFkmqPoNhEDW7Bxsrt8M+16VWYYnMtl47iKZjQccyUyXEIg027L9GVYxN39ekWg==",
                SecurityStamp = "EM3VWJZHCPH3MYEINTHQYHVCWEDDYCUV",
                ConcurrencyStamp = "471a9303-4888-482b-abcf-6bce1e025719",
                LockoutEnd = null,
                LockoutEnabled = true,
                AccessFailedCount = 0
            },
            new User
            {
                Id = Guid.NewGuid().ToString(),
                FirstName = "User",
                SecondName = "3",
                UserName = "user3@test.com",
                NormalizedUserName = "user3@test.com".ToUpper(),
                Email = "user3@test.com",
                NormalizedEmail = "user3@test.com".ToUpper(),
                PasswordHash = "AQAAAAIAAYagAAAAEGboD1FRWryugI0cZashzY9oX0HbYleTNgDuucjUHATdcsg596/Pvxgta8vgKy+ahw==",
                SecurityStamp = "2OCDPDEX2FEYQFBHYR2NPSVUXRJP7NZU",
                ConcurrencyStamp = "1850ad70-8df7-4c8d-9f6b-9c83b2bf6241",
                LockoutEnd = null,
                LockoutEnabled = true,
                AccessFailedCount = 0
            }
        );
    }
}