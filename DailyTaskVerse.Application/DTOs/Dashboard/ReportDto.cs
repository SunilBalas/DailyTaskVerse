namespace DailyTaskVerse.Application.DTOs.Dashboard;

public class WeeklyReportDto
{
    public List<DailyStatDto> DailyStats { get; set; } = new();
}

public class MonthlyReportDto
{
    public List<WeeklyStatDto> WeeklyStats { get; set; } = new();
}

public class DailyStatDto
{
    public string Date { get; set; } = string.Empty;
    public int Completed { get; set; }
    public int Total { get; set; }
}

public class WeeklyStatDto
{
    public string Week { get; set; } = string.Empty;
    public int Completed { get; set; }
    public int Total { get; set; }
    public double ProductivityPercentage { get; set; }
}

public class StatusDistributionDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
