using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Infrastructure.Data;

namespace DailyTaskVerse.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.Users.CountAsync();
    }

    public async Task<int> GetActiveCountAsync(DateTime since)
    {
        return await _context.Users
            .CountAsync(u => u.LastLoginAt != null && u.LastLoginAt >= since);
    }

    public async Task<List<ApplicationUser>> GetAllWithTaskCountAsync()
    {
        return await _context.Users
            .Include(u => u.Tasks)
            .OrderByDescending(u => u.LastLoginAt)
            .ToListAsync();
    }
}
