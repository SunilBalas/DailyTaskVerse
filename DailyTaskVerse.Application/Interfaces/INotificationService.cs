using DailyTaskVerse.Application.DTOs.Notifications;

namespace DailyTaskVerse.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetAllAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid id);
    Task MarkAllAsReadAsync(Guid userId);
}
