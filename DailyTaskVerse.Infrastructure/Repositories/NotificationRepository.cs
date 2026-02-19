using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Infrastructure.Data;

namespace DailyTaskVerse.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, int limit = 50)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<Notification> CreateAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification != null)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task<bool> ExistsAsync(Guid userId, Guid taskId, NotificationType type)
    {
        return await _context.Notifications
            .AnyAsync(n => n.UserId == userId && n.TaskId == taskId && n.Type == type);
    }

    public async Task ClearTaskReferencesAsync(Guid taskId)
    {
        await _context.Notifications
            .Where(n => n.TaskId == taskId)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.TaskId, (Guid?)null));
    }
}
