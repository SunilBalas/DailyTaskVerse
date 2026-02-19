namespace DailyTaskVerse.Application.DTOs.DailyLogs;

public class DailyLogDto
{
    public Guid Id { get; set; }
    public DateTime LogDate { get; set; }
    public string? FromTime { get; set; }
    public string? ToTime { get; set; }
    public string Content { get; set; } = string.Empty;
    public decimal? HoursSpent { get; set; }
    public DateTime CreatedAt { get; set; }
}
