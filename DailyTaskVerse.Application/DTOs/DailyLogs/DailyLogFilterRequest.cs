namespace DailyTaskVerse.Application.DTOs.DailyLogs;

public class DailyLogFilterRequest
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
