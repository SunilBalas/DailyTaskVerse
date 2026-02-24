using Microsoft.AspNetCore.Identity;
using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public TimeSpan StandupTime { get; set; } = new TimeSpan(10, 0, 0);

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<DailyLog> DailyLogs { get; set; } = new List<DailyLog>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public AzureDevOpsSettings? AzureDevOpsSettings { get; set; }
}
