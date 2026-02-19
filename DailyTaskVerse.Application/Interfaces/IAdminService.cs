using DailyTaskVerse.Application.DTOs.Admin;

namespace DailyTaskVerse.Application.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardDto> GetAdminDashboardAsync();
    Task<List<UserListDto>> GetUsersAsync();
}
