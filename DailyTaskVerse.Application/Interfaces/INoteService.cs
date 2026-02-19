using DailyTaskVerse.Application.DTOs.Notes;

namespace DailyTaskVerse.Application.Interfaces;

public interface INoteService
{
    Task<List<NoteDto>> GetAllAsync(Guid userId);
    Task<NoteDto> GetByIdAsync(Guid id, Guid userId);
    Task<NoteDto> CreateAsync(Guid userId, CreateNoteRequest request);
    Task<NoteDto> UpdateAsync(Guid id, Guid userId, UpdateNoteRequest request);
    Task DeleteAsync(Guid id, Guid userId);
}
