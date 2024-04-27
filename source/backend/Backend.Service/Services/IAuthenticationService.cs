namespace Backend.Service.Services;

using Backend.Domain.DTO;

public interface IAuthenticationService
{
    public Task<UserDto> LoginAsync(LoginDto loginData);
}