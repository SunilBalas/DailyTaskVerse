namespace DailyTaskVerse.Application.DTOs.Dashboard;

public class TimesheetDto
{
    public DateTime WeekStart { get; set; }
    public DateTime WeekEnd { get; set; }
    public decimal TotalHours { get; set; }
    public List<TimesheetDayDto> Days { get; set; } = new();
}

public class TimesheetDayDto
{
    public DateTime Date { get; set; }
    public string DayName { get; set; } = string.Empty;
    public decimal? HoursSpent { get; set; }
    public string? LogContent { get; set; }
    public int TasksCompleted { get; set; }
}
