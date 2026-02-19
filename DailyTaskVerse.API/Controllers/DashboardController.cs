using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.DTOs.Dashboard;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Entities;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardController(IDashboardService dashboardService, UserManager<ApplicationUser> userManager)
    {
        _dashboardService = dashboardService;
        _userManager = userManager;
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetDashboard(Guid userId)
    {
        var result = await _dashboardService.GetDashboardAsync(userId);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/weekly-report")]
    public async Task<IActionResult> GetWeeklyReport(Guid userId)
    {
        var result = await _dashboardService.GetWeeklyReportAsync(userId);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/monthly-report")]
    public async Task<IActionResult> GetMonthlyReport(Guid userId)
    {
        var result = await _dashboardService.GetMonthlyReportAsync(userId);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/status-distribution")]
    public async Task<IActionResult> GetStatusDistribution(Guid userId)
    {
        var result = await _dashboardService.GetStatusDistributionAsync(userId);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/standup")]
    public async Task<IActionResult> GetStandup(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        var standupTime = user?.StandupTime ?? new TimeSpan(10, 0, 0);
        var result = await _dashboardService.GetStandupAsync(userId, standupTime);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/standup-config")]
    public async Task<IActionResult> GetStandupConfig(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();

        return Ok(new StandupConfigDto
        {
            StandupTime = user.StandupTime.ToString(@"hh\:mm")
        });
    }

    [HttpPut("{userId:guid}/standup-config")]
    public async Task<IActionResult> UpdateStandupConfig(Guid userId, [FromBody] UpdateStandupConfigRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();

        if (!TimeSpan.TryParse(request.StandupTime, out var parsed))
            return BadRequest(new { error = "Invalid time format. Use HH:mm" });

        user.StandupTime = parsed;
        await _userManager.UpdateAsync(user);

        return Ok(new StandupConfigDto { StandupTime = parsed.ToString(@"hh\:mm") });
    }

    [HttpGet("{userId:guid}/timesheet")]
    public async Task<IActionResult> GetTimesheet(Guid userId, [FromQuery] DateTime? weekStart)
    {
        var start = weekStart?.Date ?? GetCurrentWeekStart();
        var result = await _dashboardService.GetTimesheetAsync(userId, start);
        return Ok(result);
    }

    private static DateTime GetCurrentWeekStart()
    {
        var today = DateTime.UtcNow.Date;
        var diff = (int)today.DayOfWeek - (int)DayOfWeek.Monday;
        if (diff < 0) diff += 7;
        return today.AddDays(-diff);
    }
}
