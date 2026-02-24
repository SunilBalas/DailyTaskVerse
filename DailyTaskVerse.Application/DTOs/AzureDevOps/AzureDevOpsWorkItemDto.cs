namespace DailyTaskVerse.Application.DTOs.AzureDevOps;

public class AzureDevOpsWorkItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string WorkItemType { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? AreaPath { get; set; }
    public string? IterationPath { get; set; }
    public DateTime? ChangedDate { get; set; }
    public string ProjectName { get; set; } = string.Empty;
}
