using System.ComponentModel.DataAnnotations;

namespace DailyTaskVerse.Application.DTOs.Tasks;

public class CreateTaskRequest
{
    [Required, MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Priority { get; set; } = "Medium";

    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    public bool IsRecurring { get; set; }

    [MaxLength(20)]
    public string? RecurrencePattern { get; set; }

    public DateTime? DueDate { get; set; }
    public DateTime? ReminderAt { get; set; }
}
