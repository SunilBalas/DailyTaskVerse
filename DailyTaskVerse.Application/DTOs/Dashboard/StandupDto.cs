namespace DailyTaskVerse.Application.DTOs.Dashboard;

public class StandupDto
{
    public string StandupTime { get; set; } = string.Empty;
    public DateTime ReportingWindowStart { get; set; }
    public DateTime ReportingWindowEnd { get; set; }
    public DateTime PreviousWindowStart { get; set; }
    public DateTime PreviousWindowEnd { get; set; }
    public List<StandupTaskDto> YesterdayTasks { get; set; } = new();
    public string? YesterdayLog { get; set; }
    public decimal? YesterdayHours { get; set; }
    public List<StandupTaskDto> TodayTasks { get; set; } = new();
    public string? TodayLog { get; set; }
    public decimal? TodayHours { get; set; }
    public List<StandupTaskDto> Impediments { get; set; } = new();
}

public class StandupTaskDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Category { get; set; }
    public bool IsImpediment { get; set; }
    public string? ImpedimentKeyword { get; set; }
}

public class StandupConfigDto
{
    public string StandupTime { get; set; } = "10:00";
}

public class UpdateStandupConfigRequest
{
    public string StandupTime { get; set; } = "10:00";
}
