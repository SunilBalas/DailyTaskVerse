using DailyTaskVerse.Domain.Entities;

namespace DailyTaskVerse.Domain.Interfaces;

public interface INoteRepository
{
    Task<Note?> GetByIdAsync(Guid id);
    Task<IEnumerable<Note>> GetByUserIdAsync(Guid userId);
    Task<Note> CreateAsync(Note note);
    Task<Note> UpdateAsync(Note note);
    Task DeleteAsync(Guid id);
}
