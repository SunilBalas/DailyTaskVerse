namespace DailyTaskVerse.Domain.Entities;

public class DailyLog
{
    public Guid Id { get; set; }
    public DateTime LogDate { get; set; }
    public TimeSpan? FromTime { get; set; }
    public TimeSpan? ToTime { get; set; }
    public string Content { get; set; } = string.Empty;
    public decimal? HoursSpent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
