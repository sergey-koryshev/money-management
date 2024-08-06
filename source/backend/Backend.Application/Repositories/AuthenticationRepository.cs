namespace Backend.Application.Repositories;

using Backend.Domain.DTO;
using Backend.Domain.Entities;
using Backend.Domain.Models.Mappers;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Models = Domain.Models;

public class AuthenticationRepository
{
    private readonly SignInManager<User> signInManager;
    private readonly UserManager<User> userManager;
    private readonly AppDbContext dbContext;

    public AuthenticationRepository(SignInManager<User> signInManager, UserManager<User> userManager, AppDbContext dbContext)
    {
        this.signInManager = signInManager;
        this.userManager = userManager;
        this.dbContext = dbContext;
    }

    public async Task<Models.Person> LoginAsync(LoginDto loginData)
    {
        var user = await this.userManager.FindByNameAsync(loginData.UserName)
            ?? throw new InvalidOperationException("Invalid credentials.");

        var checkResult = await this.signInManager.CheckPasswordSignInAsync(user, loginData.Password, true);

        if (!checkResult.Succeeded)
        {
            if (checkResult.IsLockedOut)
            {
                throw new InvalidOperationException("Maximum number of login attempts is reached, please try again later.");
            }

            throw new InvalidOperationException("Invalid credentials.");
        }

        var person = this.dbContext.Persons.FirstOrDefault(p => p.UserId == user.Id)
            ?? throw new InvalidOperationException("Please contact administrator to proceed with login process.");

        return person.ToModel();
    }
}

