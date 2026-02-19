using DailyTaskVerse.Application.DTOs.Common;
using DailyTaskVerse.Application.DTOs.Tasks;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly INotificationRepository _notificationRepository;

    public TaskService(ITaskRepository taskRepository, INotificationRepository notificationRepository)
    {
        _taskRepository = taskRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<TaskDto> GetByIdAsync(Guid id, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null || task.UserId != userId)
            throw new KeyNotFoundException("Task not found.");

        return MapToDto(task);
    }

    public async Task<PagedResult<TaskDto>> GetAllAsync(Guid userId, TaskFilterRequest filter)
    {
        var status = Enum.TryParse<TaskItemStatus>(filter.Status, true, out var s) ? s : (TaskItemStatus?)null;
        var priority = Enum.TryParse<TaskPriority>(filter.Priority, true, out var p) ? p : (TaskPriority?)null;

        var tasks = await _taskRepository.GetAllByUserIdAsync(userId, status, priority, filter.Category, filter.Page, filter.PageSize);
        var totalCount = await _taskRepository.GetCountByUserIdAsync(userId, status, priority, filter.Category);

        return new PagedResult<TaskDto>
        {
            Items = tasks.Select(MapToDto),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<TaskDto> CreateAsync(Guid userId, CreateTaskRequest request)
    {
        if (!Enum.TryParse<TaskPriority>(request.Priority, true, out var priority))
            throw new ArgumentException("Invalid priority value.");

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Priority = priority,
            Status = TaskItemStatus.Pending,
            Category = request.Category,
            IsRecurring = request.IsRecurring,
            RecurrencePattern = request.IsRecurring ? request.RecurrencePattern : null,
            DueDate = request.DueDate,
            ReminderAt = request.ReminderAt,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _taskRepository.CreateAsync(task);
        return MapToDto(created);
    }

    public async Task<TaskDto> UpdateAsync(Guid id, Guid userId, UpdateTaskRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null || task.UserId != userId)
            throw new KeyNotFoundException("Task not found.");

        if (!Enum.TryParse<TaskPriority>(request.Priority, true, out var priority))
            throw new ArgumentException("Invalid priority value.");

        if (!Enum.TryParse<TaskItemStatus>(request.Status, true, out var status))
            throw new ArgumentException("Invalid status value.");

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = priority;
        task.Status = status;
        task.Category = request.Category;
        task.IsRecurring = request.IsRecurring;
        task.RecurrencePattern = request.IsRecurring ? request.RecurrencePattern : null;
        task.DueDate = request.DueDate;
        task.ReminderAt = request.ReminderAt;

        var updated = await _taskRepository.UpdateAsync(task);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null || task.UserId != userId)
            throw new KeyNotFoundException("Task not found.");

        await _notificationRepository.ClearTaskReferencesAsync(id);
        await _taskRepository.DeleteAsync(id);
    }

    public async Task<TaskDto> MarkAsCompletedAsync(Guid id, Guid userId)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task == null || task.UserId != userId)
            throw new KeyNotFoundException("Task not found.");

        task.Status = TaskItemStatus.Completed;
        var updated = await _taskRepository.UpdateAsync(task);

        if (task.IsRecurring && !string.IsNullOrEmpty(task.RecurrencePattern))
        {
            var nextDue = GetNextOccurrence(DateTime.UtcNow, task.RecurrencePattern);
            var newTask = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority,
                Status = TaskItemStatus.Pending,
                Category = task.Category,
                IsRecurring = true,
                RecurrencePattern = task.RecurrencePattern,
                DueDate = nextDue,
                UserId = task.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _taskRepository.CreateAsync(newTask);
        }

        return MapToDto(updated);
    }

    private static TaskDto MapToDto(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        Priority = task.Priority.ToString(),
        Status = task.Status.ToString(),
        Category = task.Category,
        IsRecurring = task.IsRecurring,
        RecurrencePattern = task.RecurrencePattern,
        DueDate = task.DueDate,
        ReminderAt = task.ReminderAt,
        CreatedAt = task.CreatedAt,
        UpdatedAt = task.UpdatedAt
    };

    private static DateTime GetNextOccurrence(DateTime from, string pattern)
    {
        return pattern switch
        {
            "Daily" => from.Date.AddDays(1),
            "Weekly" => from.Date.AddDays(7),
            "Monthly" => from.Date.AddMonths(1),
            _ => from.Date.AddDays(1)
        };
    }
}
