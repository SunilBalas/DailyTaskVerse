using DailyTaskVerse.Application.DTOs.Auth;

namespace DailyTaskVerse.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
}
