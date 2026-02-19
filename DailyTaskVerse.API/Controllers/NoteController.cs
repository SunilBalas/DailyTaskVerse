using Microsoft.AspNetCore.Mvc;
using DailyTaskVerse.Application.DTOs.Notes;
using DailyTaskVerse.Application.Interfaces;

namespace DailyTaskVerse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NoteController : ControllerBase
{
    private readonly INoteService _noteService;

    public NoteController(INoteService noteService)
    {
        _noteService = noteService;
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetAll(Guid userId)
    {
        var result = await _noteService.GetAllAsync(userId);
        return Ok(result);
    }

    [HttpGet("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> GetById(Guid userId, Guid id)
    {
        var result = await _noteService.GetByIdAsync(id, userId);
        return Ok(result);
    }

    [HttpPost("{userId:guid}")]
    public async Task<IActionResult> Create(Guid userId, CreateNoteRequest request)
    {
        var result = await _noteService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { userId, id = result.Id }, result);
    }

    [HttpPut("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> Update(Guid userId, Guid id, UpdateNoteRequest request)
    {
        var result = await _noteService.UpdateAsync(id, userId, request);
        return Ok(result);
    }

    [HttpDelete("{userId:guid}/{id:guid}")]
    public async Task<IActionResult> Delete(Guid userId, Guid id)
    {
        await _noteService.DeleteAsync(id, userId);
        return NoContent();
    }
}
