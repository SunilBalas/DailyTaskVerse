using DailyTaskVerse.Domain.Enums;

namespace DailyTaskVerse.Application.Interfaces;

public interface IExportService
{
    Task<byte[]> ExportTasksAsync(Guid userId, TaskItemStatus? status, TaskPriority? priority, string? category);
    Task<byte[]> ExportDailyLogsAsync(Guid userId);
    Task<byte[]> ExportTimesheetAsync(Guid userId, DateTime weekStart);
    Task<byte[]> ExportNotesAsync(Guid userId);
}
