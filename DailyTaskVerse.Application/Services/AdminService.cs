using DailyTaskVerse.Application.DTOs.Admin;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;

    public AdminService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var weekStart = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        if (today.DayOfWeek == DayOfWeek.Sunday)
            weekStart = weekStart.AddDays(-7);

        var totalUsers = await _userRepository.GetTotalCountAsync();
        var activeToday = await _userRepository.GetActiveCountAsync(today);
        var activeThisWeek = await _userRepository.GetActiveCountAsync(weekStart);

        var users = await _userRepository.GetAllWithTaskCountAsync();
        var totalTasks = users.Sum(u => u.Tasks.Count);
        var completedTasks = users.Sum(u => u.Tasks.Count(t => t.Status == TaskItemStatus.Completed));
        var overallProductivity = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

        return new AdminDashboardDto
        {
            TotalUsers = totalUsers,
            ActiveToday = activeToday,
            ActiveThisWeek = activeThisWeek,
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            OverallProductivity = overallProductivity
        };
    }

    public async Task<List<UserListDto>> GetUsersAsync()
    {
        var users = await _userRepository.GetAllWithTaskCountAsync();

        return users.Select(u => new UserListDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email!,
            Role = u.Role.ToString(),
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt,
            TaskCount = u.Tasks.Count
        }).ToList();
    }
}
