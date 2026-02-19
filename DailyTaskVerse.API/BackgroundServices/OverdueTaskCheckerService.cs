using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Enums;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.API.BackgroundServices;

public class OverdueTaskCheckerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OverdueTaskCheckerService> _logger;

    public OverdueTaskCheckerService(IServiceProvider serviceProvider, ILogger<OverdueTaskCheckerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OverdueTaskCheckerService started");

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(30));

        // Run immediately on startup, then every 30 minutes
        await CheckOverdueTasks(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await CheckOverdueTasks(stoppingToken);
        }
    }

    private async Task CheckOverdueTasks(CancellationToken stoppingToken)
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

                // Get all non-completed tasks for this user
                var tasks = await taskRepository.GetAllByUserIdAsync(user.Id, null, null, null, 1, 10000);
                var overdueTasks = tasks.Where(t =>
                    t.Status != TaskItemStatus.Completed &&
                    t.DueDate.HasValue &&
                    t.DueDate.Value < DateTime.UtcNow);

                foreach (var task in overdueTasks)
                {
                    var alreadyNotified = await notificationRepository.ExistsAsync(user.Id, task.Id, NotificationType.TaskOverdue);
                    if (alreadyNotified) continue;

                    var notification = new Notification
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        TaskId = task.Id,
                        Type = NotificationType.TaskOverdue,
                        Title = "Task Overdue",
                        Message = $"\"{task.Title}\" was due on {task.DueDate.Value:MMM dd, yyyy}",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    await notificationRepository.CreateAsync(notification);
                    _logger.LogInformation("Created overdue notification for task {TaskId} user {UserId}", task.Id, user.Id);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking overdue tasks");
        }
    }
}
