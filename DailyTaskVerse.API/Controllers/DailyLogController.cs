using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.DTOs.DailyLogs;
using DailyTaskVerse.Application.Interfaces;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyLogController : ControllerBase
{
    private readonly IDailyLogService _dailyLogService;

    public DailyLogController(IDailyLogService dailyLogService)
    {
        _dailyLogService = dailyLogService;
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetAll(Guid userId, [FromQuery] DailyLogFilterRequest filter)
    {
        var result = await _dailyLogService.GetAllAsync(userId, filter);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> GetById(Guid userId, Guid id)
    {
        var result = await _dailyLogService.GetByIdAsync(id, userId);
        return Ok(result);
    }

    [HttpPost("{userId:guid}")]
    public async Task<IActionResult> Create(Guid userId, [FromBody] CreateDailyLogRequest request)
    {
        var result = await _dailyLogService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { userId, id = result.Id }, result);
    }

    [HttpPut("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> Update(Guid userId, Guid id, [FromBody] UpdateDailyLogRequest request)
    {
        var result = await _dailyLogService.UpdateAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> Delete(Guid userId, Guid id)
    {
        await _dailyLogService.DeleteAsync(id, userId);
        return NoContent();
    }
}
