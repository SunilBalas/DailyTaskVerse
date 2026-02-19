using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;
    public string Category { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ReminderAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
