using DailyTaskVerse.Application.DTOs.Notifications;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<IEnumerable<NotificationDto>> GetAllAsync(Guid userId)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(userId);
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type.ToString(),
            IsRead = n.IsRead,
            TaskId = n.TaskId,
            CreatedAt = n.CreatedAt
        });
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId);
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        await _notificationRepository.MarkAsReadAsync(id);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId);
    }
}
