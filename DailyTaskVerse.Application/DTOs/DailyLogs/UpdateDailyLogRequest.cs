using System.ComponentModel.DataAnnotations;

namespace DailyTaskVerse.Application.DTOs.DailyLogs;

public class UpdateDailyLogRequest
{
    public string? FromTime { get; set; }
    public string? ToTime { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    [Range(0.25, 24, ErrorMessage = "Hours must be between 0.25 and 24.")]
    public decimal? HoursSpent { get; set; }
}
