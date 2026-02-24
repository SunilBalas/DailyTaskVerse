using DailyTaskVerse.Domain.Entities;

namespace DailyTaskVerse.Domain.Interfaces;

public interface IAzureDevOpsSettingsRepository
{
    Task<AzureDevOpsSettings?> GetByUserIdAsync(Guid userId);
    Task<AzureDevOpsSettings> CreateAsync(AzureDevOpsSettings settings);
    Task<AzureDevOpsSettings> UpdateAsync(AzureDevOpsSettings settings);
    Task DeleteAsync(Guid userId);
}
