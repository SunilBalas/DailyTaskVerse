using Microsoft.AspNetCore.Identity;
using DailyTaskVerse.Application.DTOs.Auth;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedAccessException("Invalid email or password.");

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return MapToAuthResponse(user);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            UserName = request.Email,
            Role = UserRole.Employee,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        return MapToAuthResponse(user);
    }

    private static AuthResponse MapToAuthResponse(ApplicationUser user)
    {
        return new AuthResponse
        {
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email!,
                Role = user.Role.ToString()
            }
        };
    }
}
