using DailyTaskVerse.Application.DTOs.Dashboard;

namespace DailyTaskVerse.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(Guid userId);
    Task<WeeklyReportDto> GetWeeklyReportAsync(Guid userId);
    Task<MonthlyReportDto> GetMonthlyReportAsync(Guid userId);
    Task<List<StatusDistributionDto>> GetStatusDistributionAsync(Guid userId);
    Task<StandupDto> GetStandupAsync(Guid userId, TimeSpan standupTime);
    Task<TimesheetDto> GetTimesheetAsync(Guid userId, DateTime weekStart);
}
