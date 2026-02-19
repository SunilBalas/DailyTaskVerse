using ClosedXML.Excel;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class ExportService : IExportService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IDailyLogRepository _dailyLogRepository;
    private readonly INoteRepository _noteRepository;

    public ExportService(ITaskRepository taskRepository, IDailyLogRepository dailyLogRepository, INoteRepository noteRepository)
    {
        _taskRepository = taskRepository;
        _dailyLogRepository = dailyLogRepository;
        _noteRepository = noteRepository;
    }

    public async Task<byte[]> ExportTasksAsync(Guid userId, TaskItemStatus? status, TaskPriority? priority, string? category)
    {
        var tasks = await _taskRepository.GetAllByUserIdAsync(userId, status, priority, category, 1, 10000);

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Tasks");

        var headers = new[] { "Title", "Description", "Priority", "Status", "Category", "Due Date", "Recurring", "Pattern", "Created", "Updated" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(1, i + 1).Value = headers[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
            ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4f46e5");
            ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        int row = 2;
        foreach (var task in tasks)
        {
            ws.Cell(row, 1).Value = task.Title;
            ws.Cell(row, 2).Value = task.Description;
            ws.Cell(row, 3).Value = task.Priority.ToString();
            ws.Cell(row, 4).Value = task.Status.ToString();
            ws.Cell(row, 5).Value = task.Category;
            ws.Cell(row, 6).Value = task.DueDate?.ToString("yyyy-MM-dd") ?? "";
            ws.Cell(row, 7).Value = task.IsRecurring ? "Yes" : "No";
            ws.Cell(row, 8).Value = task.RecurrencePattern ?? "";
            ws.Cell(row, 9).Value = task.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            ws.Cell(row, 10).Value = task.UpdatedAt.ToString("yyyy-MM-dd HH:mm");
            row++;
        }

        ws.Columns().AdjustToContents();
        return WorkbookToBytes(workbook);
    }

    public async Task<byte[]> ExportDailyLogsAsync(Guid userId)
    {
        var count = await _dailyLogRepository.GetCountByUserIdAsync(userId);
        var logs = await _dailyLogRepository.GetByUserIdAsync(userId, 1, Math.Max(count, 1));

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Daily Logs");

        var headers = new[] { "Date", "Content", "Hours Spent" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(1, i + 1).Value = headers[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
            ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4f46e5");
            ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        int row = 2;
        foreach (var log in logs)
        {
            ws.Cell(row, 1).Value = log.LogDate.ToString("yyyy-MM-dd");
            ws.Cell(row, 2).Value = log.Content;
            ws.Cell(row, 3).Value = log.HoursSpent?.ToString("F1") ?? "";
            row++;
        }

        ws.Columns().AdjustToContents();
        return WorkbookToBytes(workbook);
    }

    public async Task<byte[]> ExportTimesheetAsync(Guid userId, DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(7);
        var logs = await _dailyLogRepository.GetByDateRangeAsync(userId, weekStart, weekEnd);
        var taskStats = await _taskRepository.GetDailyStatsAsync(userId, weekStart, weekEnd);
        var logDict = logs.ToDictionary(l => l.LogDate.Date);

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Timesheet");

        var headers = new[] { "Day", "Date", "Hours Spent", "Tasks Completed", "Log Content" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(1, i + 1).Value = headers[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
            ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4f46e5");
            ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        int row = 2;
        decimal totalHours = 0;
        int totalTasks = 0;

        for (var date = weekStart; date < weekEnd; date = date.AddDays(1))
        {
            logDict.TryGetValue(date.Date, out var log);
            var stat = taskStats.FirstOrDefault(s => s.Date == date.Date);

            ws.Cell(row, 1).Value = date.ToString("dddd");
            ws.Cell(row, 2).Value = date.ToString("yyyy-MM-dd");
            ws.Cell(row, 3).Value = log?.HoursSpent?.ToString("F1") ?? "0";
            ws.Cell(row, 4).Value = stat.Completed;
            ws.Cell(row, 5).Value = log?.Content ?? "";

            if (log?.HoursSpent.HasValue == true) totalHours += log.HoursSpent.Value;
            totalTasks += stat.Completed;
            row++;
        }

        // Summary row
        row++;
        ws.Cell(row, 1).Value = "Total";
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 3).Value = totalHours.ToString("F1");
        ws.Cell(row, 3).Style.Font.Bold = true;
        ws.Cell(row, 4).Value = totalTasks;
        ws.Cell(row, 4).Style.Font.Bold = true;

        ws.Columns().AdjustToContents();
        return WorkbookToBytes(workbook);
    }

    public async Task<byte[]> ExportNotesAsync(Guid userId)
    {
        var notes = await _noteRepository.GetByUserIdAsync(userId);

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Notes");

        var headers = new[] { "Title", "Content", "Pinned", "Created", "Updated" };
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(1, i + 1).Value = headers[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
            ws.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4f46e5");
            ws.Cell(1, i + 1).Style.Font.FontColor = XLColor.White;
        }

        int row = 2;
        foreach (var note in notes)
        {
            ws.Cell(row, 1).Value = note.Title;
            ws.Cell(row, 2).Value = note.Content;
            ws.Cell(row, 3).Value = note.IsPinned ? "Yes" : "No";
            ws.Cell(row, 4).Value = note.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            ws.Cell(row, 5).Value = note.UpdatedAt.ToString("yyyy-MM-dd HH:mm");
            row++;
        }

        ws.Columns().AdjustToContents();
        return WorkbookToBytes(workbook);
    }

    private static byte[] WorkbookToBytes(XLWorkbook workbook)
    {
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
