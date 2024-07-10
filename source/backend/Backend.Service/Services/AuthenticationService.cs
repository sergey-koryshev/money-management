namespace Backend.Service.Services;

using AutoMapper;
using Backend.Application.Repositories;
using Backend.Domain.DTO;
using Backend.Domain.Entities;
using Backend.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class AuthenticationService : IAuthenticationService
{
    private readonly SignInManager<User> signInManager;
    private readonly UserManager<User> userManager;
    private readonly IMapper mapper;
    private readonly IDbContextFactory<AppDbContext> dbContextFactory;

    public AuthenticationService(SignInManager<User> signInManager, UserManager<User> userManager, IMapper mapper,  IDbContextFactory<AppDbContext> dbContextFactory)
    {
        this.signInManager = signInManager;
        this.userManager = userManager;
        this.mapper = mapper;
        this.dbContextFactory = dbContextFactory;
    }

    public async Task<PersonDto> LoginAsync(LoginDto loginData)
    {
        var person = await new AuthenticationRepository(this.signInManager, this.userManager, this.dbContextFactory.CreateDbContext()).LoginAsync(loginData);
        return this.mapper.Map<PersonDto>(person);
    }
}