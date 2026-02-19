namespace DailyTaskVerse.Application.DTOs.Tasks;

public class TaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ReminderAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
