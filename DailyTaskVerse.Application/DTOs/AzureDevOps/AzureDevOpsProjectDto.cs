namespace DailyTaskVerse.Application.DTOs.AzureDevOps;

public class AzureDevOpsProjectDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string State { get; set; } = string.Empty;
}
