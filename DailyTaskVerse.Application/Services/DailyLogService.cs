using DailyTaskVerse.Application.DTOs.Common;
using DailyTaskVerse.Application.DTOs.DailyLogs;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class DailyLogService : IDailyLogService
{
    private readonly IDailyLogRepository _dailyLogRepository;

    public DailyLogService(IDailyLogRepository dailyLogRepository)
    {
        _dailyLogRepository = dailyLogRepository;
    }

    public async Task<DailyLogDto> GetByIdAsync(Guid id, Guid userId)
    {
        var log = await _dailyLogRepository.GetByIdAsync(id);
        if (log == null || log.UserId != userId)
            throw new KeyNotFoundException("Daily log not found.");

        return MapToDto(log);
    }

    public async Task<PagedResult<DailyLogDto>> GetAllAsync(Guid userId, int page, int pageSize)
    {
        var logs = await _dailyLogRepository.GetByUserIdAsync(userId, page, pageSize);
        var totalCount = await _dailyLogRepository.GetCountByUserIdAsync(userId);

        return new PagedResult<DailyLogDto>
        {
            Items = logs.Select(MapToDto),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<DailyLogDto> CreateAsync(Guid userId, CreateDailyLogRequest request)
    {
        var log = new DailyLog
        {
            Id = Guid.NewGuid(),
            LogDate = request.LogDate.Date,
            FromTime = ParseTime(request.FromTime),
            ToTime = ParseTime(request.ToTime),
            Content = request.Content,
            HoursSpent = request.HoursSpent,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _dailyLogRepository.CreateAsync(log);
        return MapToDto(created);
    }

    public async Task<DailyLogDto> UpdateAsync(Guid id, Guid userId, UpdateDailyLogRequest request)
    {
        var log = await _dailyLogRepository.GetByIdAsync(id);
        if (log == null || log.UserId != userId)
            throw new KeyNotFoundException("Daily log not found.");

        log.FromTime = ParseTime(request.FromTime);
        log.ToTime = ParseTime(request.ToTime);
        log.Content = request.Content;
        log.HoursSpent = request.HoursSpent;

        var updated = await _dailyLogRepository.UpdateAsync(log);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var log = await _dailyLogRepository.GetByIdAsync(id);
        if (log == null || log.UserId != userId)
            throw new KeyNotFoundException("Daily log not found.");

        await _dailyLogRepository.DeleteAsync(id);
    }

    private static DailyLogDto MapToDto(DailyLog log) => new()
    {
        Id = log.Id,
        LogDate = log.LogDate,
        FromTime = log.FromTime?.ToString(@"hh\:mm"),
        ToTime = log.ToTime?.ToString(@"hh\:mm"),
        Content = log.Content,
        HoursSpent = log.HoursSpent,
        CreatedAt = log.CreatedAt
    };

    private static TimeSpan? ParseTime(string? time)
    {
        if (string.IsNullOrWhiteSpace(time)) return null;
        return TimeSpan.TryParse(time, out var ts) ? ts : null;
    }
}
