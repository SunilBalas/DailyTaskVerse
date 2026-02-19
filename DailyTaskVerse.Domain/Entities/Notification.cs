using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid? TaskId { get; set; }
    public TaskItem? Task { get; set; }
}
