using DailyTaskVerse.Application.DTOs.Common;
using DailyTaskVerse.Application.DTOs.DailyLogs;

namespace DailyTaskVerse.Application.Interfaces;

public interface IDailyLogService
{
    Task<DailyLogDto> GetByIdAsync(Guid id, Guid userId);
    Task<PagedResult<DailyLogDto>> GetAllAsync(Guid userId, int page, int pageSize);
    Task<PagedResult<DailyLogDto>> GetAllAsync(Guid userId, DailyLogFilterRequest filter);
    Task<DailyLogDto> CreateAsync(Guid userId, CreateDailyLogRequest request);
    Task<DailyLogDto> UpdateAsync(Guid id, Guid userId, UpdateDailyLogRequest request);
    Task DeleteAsync(Guid id, Guid userId);
}
