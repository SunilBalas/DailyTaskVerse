using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.Interfaces;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _adminService.GetAdminDashboardAsync();
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _adminService.GetUsersAsync();
        return Ok(result);
    }
}
