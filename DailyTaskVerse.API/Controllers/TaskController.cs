using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.DTOs.Tasks;
using DailyTaskVerse.Application.Interfaces;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetAll(Guid userId, [FromQuery] TaskFilterRequest filter)
    {
        var result = await _taskService.GetAllAsync(userId, filter);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> GetById(Guid userId, Guid id)
    {
        var result = await _taskService.GetByIdAsync(id, userId);
        return Ok(result);
    }

    [HttpPost("{userId:guid}")]
    public async Task<IActionResult> Create(Guid userId, [FromBody] CreateTaskRequest request)
    {
        var result = await _taskService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { userId, id = result.Id }, result);
    }

    [HttpPut("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> Update(Guid userId, Guid id, [FromBody] UpdateTaskRequest request)
    {
        var result = await _taskService.UpdateAsync(id, userId, request);
        return Ok(result);
    }

    [HttpPatch("{userId:guid}/{id:guid}/complete")]
    public async Task<IActionResult> MarkAsCompleted(Guid userId, Guid id)
    {
        var result = await _taskService.MarkAsCompletedAsync(id, userId);
        return Ok(result);
    }

    [HttpDelete("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> Delete(Guid userId, Guid id)
    {
        await _taskService.DeleteAsync(id, userId);
        return NoContent();
    }
}
