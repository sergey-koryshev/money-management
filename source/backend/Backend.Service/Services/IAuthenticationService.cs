namespace Backend.Service.Services;

using Backend.Domain.DTO;

public interface IAuthenticationService
{
    public Task<PersonDto> LoginAsync(LoginDto loginData);
}