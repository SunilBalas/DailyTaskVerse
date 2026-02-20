using DailyTaskVerse.Application.DTOs.Dashboard;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IDailyLogRepository _dailyLogRepository;

    public DashboardService(ITaskRepository taskRepository, IDailyLogRepository dailyLogRepository)
    {
        _taskRepository = taskRepository;
        _dailyLogRepository = dailyLogRepository;
    }

    public async Task<DashboardDto> GetDashboardAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var todayEnd = today.AddDays(1);

        var distribution = await _taskRepository.GetStatusDistributionAsync(userId);
        var total = distribution.Values.Sum();
        var completed = distribution.GetValueOrDefault(TaskItemStatus.Completed);
        var pending = distribution.GetValueOrDefault(TaskItemStatus.Pending);
        var inProgress = distribution.GetValueOrDefault(TaskItemStatus.InProgress);

        var recentTasks = await _taskRepository.GetAllByUserIdAsync(userId, null, null, null, null, 1, 5);

        return new DashboardDto
        {
            TotalTasks = total,
            CompletedTasks = completed,
            PendingTasks = pending,
            InProgressTasks = inProgress,
            ProductivityPercentage = total > 0 ? Math.Round((double)completed / total * 100, 1) : 0,
            RecentActivity = recentTasks.Select(t => new RecentActivityDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status.ToString(),
                Type = "Task",
                Timestamp = t.UpdatedAt
            }).ToList()
        };
    }

    public async Task<WeeklyReportDto> GetWeeklyReportAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        if (startOfWeek > today) startOfWeek = startOfWeek.AddDays(-7);
        var endOfWeek = startOfWeek.AddDays(7);

        var stats = await _taskRepository.GetDailyStatsAsync(userId, startOfWeek, endOfWeek);

        var dailyStats = new List<DailyStatDto>();
        for (var date = startOfWeek; date < endOfWeek; date = date.AddDays(1))
        {
            var stat = stats.FirstOrDefault(s => s.Date == date);
            dailyStats.Add(new DailyStatDto
            {
                Date = date.ToString("ddd"),
                Completed = stat.Completed,
                Total = stat.Total
            });
        }

        return new WeeklyReportDto { DailyStats = dailyStats };
    }

    public async Task<MonthlyReportDto> GetMonthlyReportAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1);

        var stats = await _taskRepository.GetDailyStatsAsync(userId, startOfMonth, endOfMonth);

        var weeklyStats = new List<WeeklyStatDto>();
        var weekStart = startOfMonth;
        int weekNum = 1;

        while (weekStart < endOfMonth)
        {
            var weekEnd = weekStart.AddDays(7) > endOfMonth ? endOfMonth : weekStart.AddDays(7);
            var weekData = stats.Where(s => s.Date >= weekStart && s.Date < weekEnd).ToList();

            var totalInWeek = weekData.Sum(w => w.Total);
            var completedInWeek = weekData.Sum(w => w.Completed);

            weeklyStats.Add(new WeeklyStatDto
            {
                Week = $"Week {weekNum}",
                Completed = completedInWeek,
                Total = totalInWeek,
                ProductivityPercentage = totalInWeek > 0 ? Math.Round((double)completedInWeek / totalInWeek * 100, 1) : 0
            });

            weekStart = weekEnd;
            weekNum++;
        }

        return new MonthlyReportDto { WeeklyStats = weeklyStats };
    }

    public async Task<List<StatusDistributionDto>> GetStatusDistributionAsync(Guid userId)
    {
        var distribution = await _taskRepository.GetStatusDistributionAsync(userId);

        return distribution.Select(kvp => new StatusDistributionDto
        {
            Status = kvp.Key.ToString(),
            Count = kvp.Value
        }).ToList();
    }

    private static readonly string[] ImpedimentKeywords =
    [
        "blocked", "waiting", "dependency", "issue", "error",
        "access required", "pending approval", "blocker", "stuck", "unable"
    ];

    private static readonly TimeSpan IstOffset = TimeSpan.FromHours(5.5);

    public async Task<StandupDto> GetStandupAsync(Guid userId, TimeSpan standupTime)
    {
        var nowUtc = DateTime.UtcNow;
        var nowIst = nowUtc.Add(IstOffset);
        var todayDsIst = nowIst.Date.Add(standupTime);

        DateTime currentWindowStartIst, currentWindowEndIst, previousWindowStartIst, previousWindowEndIst;

        if (nowIst >= todayDsIst)
        {
            currentWindowStartIst = todayDsIst;
            currentWindowEndIst = todayDsIst.AddDays(1);
            previousWindowStartIst = todayDsIst.AddDays(-1);
            previousWindowEndIst = todayDsIst;
        }
        else
        {
            currentWindowStartIst = todayDsIst.AddDays(-1);
            currentWindowEndIst = todayDsIst;
            previousWindowStartIst = todayDsIst.AddDays(-2);
            previousWindowEndIst = todayDsIst.AddDays(-1);
        }

        // Convert IST boundaries to UTC for DB queries (tasks store UpdatedAt in UTC)
        var currentWindowStartUtc = currentWindowStartIst.Subtract(IstOffset);
        var currentWindowEndUtc = currentWindowEndIst.Subtract(IstOffset);
        var previousWindowStartUtc = previousWindowStartIst.Subtract(IstOffset);
        var previousWindowEndUtc = previousWindowEndIst.Subtract(IstOffset);

        var yesterdayTasks = await _taskRepository.GetTasksUpdatedInRangeAsync(userId, previousWindowStartUtc, previousWindowEndUtc);
        var activeTasks = await _taskRepository.GetActiveTasksAsync(userId);
        var todayUpdated = await _taskRepository.GetTasksUpdatedInRangeAsync(userId, currentWindowStartUtc, currentWindowEndUtc);

        // Merge active tasks with tasks already updated in current window
        var todayTaskIds = new HashSet<Guid>(activeTasks.Select(t => t.Id));
        var mergedTodayTasks = activeTasks.ToList();
        foreach (var t in todayUpdated)
        {
            if (todayTaskIds.Add(t.Id))
                mergedTodayTasks.Add(t);
        }

        // Use IST dates for daily log queries (LogDate is a calendar date)
        var yesterdayLog = await _dailyLogRepository.GetByDateAsync(userId, previousWindowStartIst.Date);
        var todayLog = await _dailyLogRepository.GetByDateAsync(userId, currentWindowStartIst.Date);

        var yesterdayDtos = yesterdayTasks.Select(MapToStandupTaskDto).ToList();
        var todayDtos = mergedTodayTasks.Select(MapToStandupTaskDto).ToList();

        // Collect all impediments from both sections (deduplicated)
        var impediments = yesterdayDtos.Where(t => t.IsImpediment)
            .Concat(todayDtos.Where(t => t.IsImpediment))
            .GroupBy(t => t.Id)
            .Select(g => g.First())
            .ToList();

        return new StandupDto
        {
            StandupTime = standupTime.ToString(@"hh\:mm"),
            PreviousWindowStart = previousWindowStartUtc,
            PreviousWindowEnd = previousWindowEndUtc,
            ReportingWindowStart = currentWindowStartUtc,
            ReportingWindowEnd = currentWindowEndUtc,
            YesterdayTasks = yesterdayDtos,
            YesterdayLog = yesterdayLog?.Content,
            YesterdayHours = yesterdayLog?.HoursSpent,
            TodayTasks = todayDtos,
            TodayLog = todayLog?.Content,
            TodayHours = todayLog?.HoursSpent,
            Impediments = impediments
        };
    }

    private static StandupTaskDto MapToStandupTaskDto(Domain.Entities.TaskItem t)
    {
        var text = $"{t.Title} {t.Description}".ToLowerInvariant();
        string? matchedKeyword = null;

        foreach (var keyword in ImpedimentKeywords)
        {
            if (text.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                matchedKeyword = keyword;
                break;
            }
        }

        return new StandupTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Priority = t.Priority.ToString(),
            Status = t.Status.ToString(),
            Category = t.Category,
            IsImpediment = matchedKeyword != null,
            ImpedimentKeyword = matchedKeyword
        };
    }

    public async Task<TimesheetDto> GetTimesheetAsync(Guid userId, DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(7);
        var logs = await _dailyLogRepository.GetByDateRangeAsync(userId, weekStart, weekEnd);
        var taskStats = await _taskRepository.GetDailyStatsAsync(userId, weekStart, weekEnd);

        var logsByDate = logs.GroupBy(l => l.LogDate.Date)
            .ToDictionary(g => g.Key, g => g.ToList());

        var days = new List<TimesheetDayDto>();
        for (var date = weekStart; date < weekEnd; date = date.AddDays(1))
        {
            logsByDate.TryGetValue(date.Date, out var dateLogs);
            var stat = taskStats.FirstOrDefault(s => s.Date == date.Date);

            var totalHours = dateLogs?.Where(l => l.HoursSpent.HasValue).Sum(l => l.HoursSpent!.Value);
            var content = dateLogs != null
                ? string.Join("\n", dateLogs.Select(l => l.Content).Where(c => !string.IsNullOrEmpty(c)))
                : null;

            days.Add(new TimesheetDayDto
            {
                Date = date,
                DayName = date.ToString("ddd"),
                HoursSpent = totalHours,
                LogContent = content,
                TasksCompleted = stat.Completed
            });
        }

        return new TimesheetDto
        {
            WeekStart = weekStart,
            WeekEnd = weekEnd.AddDays(-1),
            TotalHours = days.Where(d => d.HoursSpent.HasValue).Sum(d => d.HoursSpent!.Value),
            Days = days
        };
    }
}
