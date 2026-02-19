using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.Interfaces;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetAll(Guid userId)
    {
        var notifications = await _notificationService.GetAllAsync(userId);
        return Ok(notifications);
    }

    [HttpGet("{userId:guid}/unread-count")]
    public async Task<IActionResult> GetUnreadCount(Guid userId)
    {
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new { count });
    }

    [HttpPatch("{userId:guid}/{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid userId, Guid id)
    {
        await _notificationService.MarkAsReadAsync(id);
        return NoContent();
    }

    [HttpPatch("{userId:guid}/read-all")]
    public async Task<IActionResult> MarkAllAsRead(Guid userId)
    {
        await _notificationService.MarkAllAsReadAsync(userId);
        return NoContent();
    }
}
