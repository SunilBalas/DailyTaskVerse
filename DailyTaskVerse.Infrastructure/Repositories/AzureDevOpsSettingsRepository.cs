using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;
using DailyTaskVerse.Domain.Interfaces;
using DailyTaskVerse.Infrastructure.Data;

namespace DailyTaskVerse.Infrastructure.Repositories;

public class AzureDevOpsSettingsRepository : IAzureDevOpsSettingsRepository
{
    private readonly AppDbContext _context;

    public AzureDevOpsSettingsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AzureDevOpsSettings?> GetByUserIdAsync(Guid userId)
    {
        return await _context.AzureDevOpsSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);
    }

    public async Task<AzureDevOpsSettings> CreateAsync(AzureDevOpsSettings settings)
    {
        _context.AzureDevOpsSettings.Add(settings);
        await _context.SaveChangesAsync();
        return settings;
    }

    public async Task<AzureDevOpsSettings> UpdateAsync(AzureDevOpsSettings settings)
    {
        settings.UpdatedAt = DateTime.UtcNow;
        _context.AzureDevOpsSettings.Update(settings);
        await _context.SaveChangesAsync();
        return settings;
    }

    public async Task DeleteAsync(Guid userId)
    {
        var settings = await _context.AzureDevOpsSettings
            .FirstOrDefaultAsync(s => s.UserId == userId);
        if (settings != null)
        {
            _context.AzureDevOpsSettings.Remove(settings);
            await _context.SaveChangesAsync();
        }
    }
}
