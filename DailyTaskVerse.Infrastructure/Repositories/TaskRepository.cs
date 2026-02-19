using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Infrastructure.Data;

namespace DailyTaskVerse.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskItem?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task<IEnumerable<TaskItem>> GetAllByUserIdAsync(
        Guid userId, TaskItemStatus? status, TaskPriority? priority, string? category, int page, int pageSize)
    {
        var query = _context.Tasks.Where(t => t.UserId == userId);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(t => t.Category == category);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountByUserIdAsync(Guid userId, TaskItemStatus? status, TaskPriority? priority, string? category)
    {
        var query = _context.Tasks.Where(t => t.UserId == userId);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(t => t.Category == category);

        return await query.CountAsync();
    }

    public async Task<TaskItem> CreateAsync(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem> UpdateAsync(TaskItem task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task DeleteAsync(Guid id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetCompletedCountAsync(Guid userId, DateTime from, DateTime to)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId && t.Status == TaskItemStatus.Completed
                        && t.UpdatedAt >= from && t.UpdatedAt <= to)
            .CountAsync();
    }

    public async Task<int> GetTotalCountAsync(Guid userId, DateTime from, DateTime to)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId && t.CreatedAt >= from && t.CreatedAt <= to)
            .CountAsync();
    }

    public async Task<Dictionary<TaskItemStatus, int>> GetStatusDistributionAsync(Guid userId)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId)
            .GroupBy(t => t.Status)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }

    public async Task<List<(DateTime Date, int Completed, int Total)>> GetDailyStatsAsync(
        Guid userId, DateTime from, DateTime to)
    {
        var tasks = await _context.Tasks
            .Where(t => t.UserId == userId && t.CreatedAt >= from && t.CreatedAt <= to)
            .ToListAsync();

        return tasks
            .GroupBy(t => t.CreatedAt.Date)
            .Select(g => (
                Date: g.Key,
                Completed: g.Count(t => t.Status == TaskItemStatus.Completed),
                Total: g.Count()
            ))
            .OrderBy(x => x.Date)
            .ToList();
    }

    public async Task<IEnumerable<TaskItem>> GetCompletedInRangeAsync(Guid userId, DateTime from, DateTime to)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId && t.Status == TaskItemStatus.Completed
                        && t.UpdatedAt >= from && t.UpdatedAt < to)
            .OrderByDescending(t => t.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetActiveTasksAsync(Guid userId)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId
                        && (t.Status == TaskItemStatus.InProgress || t.Status == TaskItemStatus.Pending))
            .OrderByDescending(t => t.Priority)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<TaskItem>> GetTasksUpdatedInRangeAsync(Guid userId, DateTime from, DateTime to)
    {
        return await _context.Tasks
            .Where(t => t.UserId == userId && t.UpdatedAt >= from && t.UpdatedAt < to)
            .OrderByDescending(t => t.UpdatedAt)
            .ToListAsync();
    }
}
