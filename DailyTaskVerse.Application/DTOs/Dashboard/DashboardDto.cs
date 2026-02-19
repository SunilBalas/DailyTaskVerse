namespace DailyTaskVerse.Application.DTOs.Dashboard;

public class DashboardDto
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int PendingTasks { get; set; }
    public int InProgressTasks { get; set; }
    public double ProductivityPercentage { get; set; }
    public List<RecentActivityDto> RecentActivity { get; set; } = new();
}

public class RecentActivityDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
