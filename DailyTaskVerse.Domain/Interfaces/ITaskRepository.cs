using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Domain.Interfaces;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(Guid id);
    Task<IEnumerable<TaskItem>> GetAllByUserIdAsync(Guid userId, TaskItemStatus? status, TaskPriority? priority, string? category, string? search, int page, int pageSize);
    Task<int> GetCountByUserIdAsync(Guid userId, TaskItemStatus? status, TaskPriority? priority, string? category, string? search);
    Task<TaskItem> CreateAsync(TaskItem task);
    Task<TaskItem> UpdateAsync(TaskItem task);
    Task DeleteAsync(Guid id);
    Task<int> GetCompletedCountAsync(Guid userId, DateTime from, DateTime to);
    Task<int> GetTotalCountAsync(Guid userId, DateTime from, DateTime to);
    Task<Dictionary<TaskItemStatus, int>> GetStatusDistributionAsync(Guid userId);
    Task<List<(DateTime Date, int Completed, int Total)>> GetDailyStatsAsync(Guid userId, DateTime from, DateTime to);
    Task<IEnumerable<TaskItem>> GetCompletedInRangeAsync(Guid userId, DateTime from, DateTime to);
    Task<IEnumerable<TaskItem>> GetActiveTasksAsync(Guid userId);
    Task<IEnumerable<TaskItem>> GetTasksUpdatedInRangeAsync(Guid userId, DateTime from, DateTime to);
}
