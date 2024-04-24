namespace Backend.WebApi.Controllers;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Domain.DTO;
using Backend.Service.Services;
using Backend.WebApi.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

[ApiController]
[Route("[controller]")]
public class AuthenticationController : ControllerBase
{
    private readonly IAuthenticationService authenticationService;
    private readonly IConfiguration config;

    public AuthenticationController(IAuthenticationService authenticationService, IConfiguration config)
    {
        this.authenticationService = authenticationService;
        this.config = config;
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await this.authenticationService.LoginAsync(loginDto);
        var token = this.GenerateJwtToken(user);
        Response.Cookies.Append("access_token", new JwtSecurityTokenHandler().WriteToken(token));
        return new AppActionResult(user);
    }

    [HttpPost]
    [AllowAnonymous]
    [Route("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");
        return new AppActionResult();
    }

    private JwtSecurityToken GenerateJwtToken(UserDto user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Tenant.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var jwtKey = this.config["Jwt:Key"];

        if (jwtKey == null)
        {
            throw new InvalidOperationException();
        }

        return new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), SecurityAlgorithms.HmacSha256)
        );
    }
}