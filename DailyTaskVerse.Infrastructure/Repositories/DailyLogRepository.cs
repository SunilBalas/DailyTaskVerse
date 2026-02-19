using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Infrastructure.Data;

namespace DailyTaskVerse.Infrastructure.Repositories;

public class DailyLogRepository : IDailyLogRepository
{
    private readonly AppDbContext _context;

    public DailyLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DailyLog?> GetByIdAsync(Guid id)
    {
        return await _context.DailyLogs.FindAsync(id);
    }

    public async Task<IEnumerable<DailyLog>> GetByUserIdAsync(Guid userId, int page, int pageSize)
    {
        return await _context.DailyLogs
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.LogDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountByUserIdAsync(Guid userId)
    {
        return await _context.DailyLogs
            .Where(d => d.UserId == userId)
            .CountAsync();
    }

    public async Task<DailyLog?> GetByDateAsync(Guid userId, DateTime date)
    {
        return await _context.DailyLogs
            .FirstOrDefaultAsync(d => d.UserId == userId && d.LogDate == date.Date);
    }

    public async Task<DailyLog> CreateAsync(DailyLog log)
    {
        _context.DailyLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<DailyLog> UpdateAsync(DailyLog log)
    {
        _context.DailyLogs.Update(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task DeleteAsync(Guid id)
    {
        var log = await _context.DailyLogs.FindAsync(id);
        if (log != null)
        {
            _context.DailyLogs.Remove(log);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<DailyLog>> GetByDateRangeAsync(Guid userId, DateTime from, DateTime to)
    {
        return await _context.DailyLogs
            .Where(d => d.UserId == userId && d.LogDate >= from.Date && d.LogDate < to.Date)
            .OrderBy(d => d.LogDate)
            .ToListAsync();
    }
}
