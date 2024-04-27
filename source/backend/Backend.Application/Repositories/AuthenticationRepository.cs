namespace Backend.Application.Repositories;

using Backend.Domain.DTO;
using Backend.Domain.Entities;
using Backend.Domain.Models;
using Microsoft.AspNetCore.Identity;

public class AuthenticationRepository
{
    private readonly SignInManager<User> signInManager;
    private readonly UserManager<User> userManager;

    public AuthenticationRepository(SignInManager<User> signInManager, UserManager<User> userManager)
	{
        this.signInManager = signInManager;
        this.userManager = userManager;
    }

    public async Task<UserModel> LoginAsync(LoginDto loginData)
    {
        var user = await this.userManager.FindByNameAsync(loginData.UserName);

        if (user == null)
        {
            throw new InvalidOperationException("Invalid credentials.");
        }

        var result = await this.signInManager.CheckPasswordSignInAsync(user, loginData.Password, true);

        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                throw new InvalidOperationException("Maximum number of login attempts is reached, please try again later.");
            }

            throw new InvalidOperationException("Invalid credentials.");
        }

        return new UserModel
        {
            Id = user.Id,
            FirstName = user.FirstName,
            SecondName = user.SecondName,
            Tenant = user.Tenant
        };
    }
}

