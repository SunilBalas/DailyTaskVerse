using DailyTaskVerse.Application.DTOs.AzureDevOps;

namespace DailyTaskVerse.Application.Interfaces;

public interface IAzureDevOpsService
{
    Task<AzureDevOpsSettingsDto> GetSettingsAsync(Guid userId);
    Task<AzureDevOpsSettingsDto> SaveSettingsAsync(Guid userId, SaveAzureDevOpsSettingsRequest request);
    Task<bool> TestConnectionAsync(string organizationUrl, string pat);
    Task<List<AzureDevOpsProjectDto>> GetProjectsAsync(Guid userId, string? organizationUrl = null, string? pat = null);
    Task<List<AzureDevOpsWorkItemDto>> GetWorkItemsAsync(Guid userId, string? projectName = null, string? search = null, string? state = null, string? type = null);
    Task<List<AzureDevOpsCommentDto>> GetWorkItemCommentsAsync(Guid userId, string projectName, int workItemId);
    Task DeleteSettingsAsync(Guid userId);
}
