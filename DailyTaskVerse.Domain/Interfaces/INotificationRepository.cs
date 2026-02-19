using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Domain.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, int limit = 50);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task<Notification> CreateAsync(Notification notification);
    Task MarkAsReadAsync(Guid id);
    Task MarkAllAsReadAsync(Guid userId);
    Task<bool> ExistsAsync(Guid userId, Guid taskId, NotificationType type);
    Task ClearTaskReferencesAsync(Guid taskId);
}
