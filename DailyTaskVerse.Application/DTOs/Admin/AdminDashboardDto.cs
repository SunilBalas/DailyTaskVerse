namespace DailyTaskVerse.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int ActiveToday { get; set; }
    public int ActiveThisWeek { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double OverallProductivity { get; set; }
}

public class UserListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int TaskCount { get; set; }
}
