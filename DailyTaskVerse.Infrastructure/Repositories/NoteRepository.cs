using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Infrastructure.Data;

namespace DailyTaskVerse.Infrastructure.Repositories;

public class NoteRepository : INoteRepository
{
    private readonly AppDbContext _context;

    public NoteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Note?> GetByIdAsync(Guid id)
    {
        return await _context.Notes.FindAsync(id);
    }

    public async Task<IEnumerable<Note>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Notes
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Note> CreateAsync(Note note)
    {
        _context.Notes.Add(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task<Note> UpdateAsync(Note note)
    {
        note.UpdatedAt = DateTime.UtcNow;
        _context.Notes.Update(note);
        await _context.SaveChangesAsync();
        return note;
    }

    public async Task DeleteAsync(Guid id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note != null)
        {
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
        }
    }
}
