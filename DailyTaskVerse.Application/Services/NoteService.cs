using DailyTaskVerse.Application.DTOs.Notes;
using DailyTaskVerse.Application.Interfaces;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;

namespace DailyTaskVerse.Application.Services;

public class NoteService : INoteService
{
    private readonly INoteRepository _noteRepository;

    public NoteService(INoteRepository noteRepository)
    {
        _noteRepository = noteRepository;
    }

    public async Task<List<NoteDto>> GetAllAsync(Guid userId)
    {
        var notes = await _noteRepository.GetByUserIdAsync(userId);
        return notes.Select(MapToDto).ToList();
    }

    public async Task<NoteDto> GetByIdAsync(Guid id, Guid userId)
    {
        var note = await _noteRepository.GetByIdAsync(id);
        if (note == null || note.UserId != userId)
            throw new KeyNotFoundException("Note not found.");

        return MapToDto(note);
    }

    public async Task<NoteDto> CreateAsync(Guid userId, CreateNoteRequest request)
    {
        var note = new Note
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            IsPinned = request.IsPinned,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _noteRepository.CreateAsync(note);
        return MapToDto(created);
    }

    public async Task<NoteDto> UpdateAsync(Guid id, Guid userId, UpdateNoteRequest request)
    {
        var note = await _noteRepository.GetByIdAsync(id);
        if (note == null || note.UserId != userId)
            throw new KeyNotFoundException("Note not found.");

        note.Title = request.Title;
        note.Content = request.Content;
        note.IsPinned = request.IsPinned;

        var updated = await _noteRepository.UpdateAsync(note);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var note = await _noteRepository.GetByIdAsync(id);
        if (note == null || note.UserId != userId)
            throw new KeyNotFoundException("Note not found.");

        await _noteRepository.DeleteAsync(id);
    }

    private static NoteDto MapToDto(Note note) => new()
    {
        Id = note.Id,
        Title = note.Title,
        Content = note.Content,
        IsPinned = note.IsPinned,
        CreatedAt = note.CreatedAt,
        UpdatedAt = note.UpdatedAt
    };
}
