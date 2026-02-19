using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private const string ExcelContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public ExportController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet("{userId:guid}/tasks")]
    public async Task<IActionResult> ExportTasks(Guid userId, [FromQuery] string? status, [FromQuery] string? priority, [FromQuery] string? category)
    {
        var parsedStatus = Enum.TryParse<TaskItemStatus>(status, true, out var s) ? s : (TaskItemStatus?)null;
        var parsedPriority = Enum.TryParse<TaskPriority>(priority, true, out var p) ? p : (TaskPriority?)null;

        var bytes = await _exportService.ExportTasksAsync(userId, parsedStatus, parsedPriority, category);
        return File(bytes, ExcelContentType, $"tasks_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("{userId:guid}/daily-logs")]
    public async Task<IActionResult> ExportDailyLogs(Guid userId)
    {
        var bytes = await _exportService.ExportDailyLogsAsync(userId);
        return File(bytes, ExcelContentType, $"daily_logs_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("{userId:guid}/timesheet")]
    public async Task<IActionResult> ExportTimesheet(Guid userId, [FromQuery] DateTime? weekStart)
    {
        var start = weekStart ?? GetCurrentWeekStart();
        var bytes = await _exportService.ExportTimesheetAsync(userId, start);
        return File(bytes, ExcelContentType, $"timesheet_{start:yyyyMMdd}.xlsx");
    }

    [HttpGet("{userId:guid}/notes")]
    public async Task<IActionResult> ExportNotes(Guid userId)
    {
        var bytes = await _exportService.ExportNotesAsync(userId);
        return File(bytes, ExcelContentType, $"notes_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    private static DateTime GetCurrentWeekStart()
    {
        var today = DateTime.UtcNow.Date;
        var diff = (int)today.DayOfWeek - (int)DayOfWeek.Monday;
        if (diff < 0) diff += 7;
        return today.AddDays(-diff);
    }
}
