namespace Backend.Service.Services;

using AutoMapper;
using Backend.Application.Repositories;
using Backend.Domain.DTO;
using Backend.Domain.Entities;
using Microsoft.AspNetCore.Identity;

public class AuthenticationService : IAuthenticationService
{
    private readonly SignInManager<User> signInManager;
    private readonly UserManager<User> userManager;
    private readonly IMapper mapper;

    public AuthenticationService(SignInManager<User> signInManager, UserManager<User> userManager, IMapper mapper)
    {
        this.signInManager = signInManager;
        this.userManager = userManager;
        this.mapper = mapper;
    }

    public async Task<UserDto> LoginAsync(LoginDto loginData)
    {
        var user = await new AuthenticationRepository(this.signInManager, this.userManager).LoginAsync(loginData);
        return this.mapper.Map<UserDto>(user);
    }
}