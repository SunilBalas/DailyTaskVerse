using Microsoft.Extensions.DependencyInjection;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Application.Services;

namespace DailyTaskVerse.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IDailyLogService, DailyLogService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<INoteService, NoteService>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
