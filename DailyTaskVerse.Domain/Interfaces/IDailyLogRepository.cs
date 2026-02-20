using DailyTaskVerse.Domain.Entities;

namespace DailyTaskVerse.Domain.Interfaces;

public interface IDailyLogRepository
{
    Task<DailyLog?> GetByIdAsync(Guid id);
    Task<IEnumerable<DailyLog>> GetByUserIdAsync(Guid userId, int page, int pageSize);
    Task<IEnumerable<DailyLog>> GetFilteredAsync(Guid userId, DateTime? dateFrom, DateTime? dateTo, string? search, int page, int pageSize);
    Task<int> GetCountByUserIdAsync(Guid userId);
    Task<int> GetFilteredCountAsync(Guid userId, DateTime? dateFrom, DateTime? dateTo, string? search);
    Task<DailyLog?> GetByDateAsync(Guid userId, DateTime date);
    Task<DailyLog> CreateAsync(DailyLog log);
    Task<DailyLog> UpdateAsync(DailyLog log);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<DailyLog>> GetByDateRangeAsync(Guid userId, DateTime from, DateTime to);
}
