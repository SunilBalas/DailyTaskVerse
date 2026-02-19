using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.API.BackgroundServices;

public class ReminderCheckerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ReminderCheckerService> _logger;

    public ReminderCheckerService(IServiceProvider serviceProvider, ILogger<ReminderCheckerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderCheckerService started");

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));

        // Run immediately on startup, then every 5 minutes
        await CheckReminders(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await CheckReminders(stoppingToken);
        }
    }

    private async Task CheckReminders(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var taskRepository = scope.ServiceProvider.GetRequiredService<ITaskRepository>();
            var notificationRepository = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();

            var users = await userRepository.GetAllWithTaskCountAsync();

            foreach (var user in users)
            {
                if (stoppingToken.IsCancellationRequested) break;

                var tasks = await taskRepository.GetAllByUserIdAsync(user.Id, null, null, null, 1, 10000);
                var dueReminders = tasks.Where(t =>
                    t.Status != TaskItemStatus.Completed &&
                    t.ReminderAt.HasValue &&
                    t.ReminderAt.Value <= DateTime.UtcNow);

                foreach (var task in dueReminders)
                {
                    var alreadyNotified = await notificationRepository.ExistsAsync(user.Id, task.Id, NotificationType.Reminder);
                    if (alreadyNotified) continue;

                    var dueDateStr = task.DueDate.HasValue ? $" due on {task.DueDate.Value:MMM dd, yyyy}" : "";
                    var notification = new Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        TaskId = task.Id,
                        Type = NotificationType.Reminder,
                        Title = "Task Reminder",
                        Message = $"\"{task.Title}\"{dueDateStr}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    await notificationRepository.CreateAsync(notification);

                    // Clear the reminder so it doesn't fire again
                    task.ReminderAt = null;
                    await taskRepository.UpdateAsync(task);

                    _logger.LogInformation("Created reminder notification for task {TaskId} user {UserId}", task.Id, user.Id);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking reminders");
        }
    }
}
