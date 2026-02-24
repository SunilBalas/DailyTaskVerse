namespace DailyTaskVerse.Application.DTOs.AzureDevOps;

public class AzureDevOpsSettingsDto
{
    public string OrganizationUrl { get; set; } = string.Empty;
    public List<string> SelectedProjectIds { get; set; } = new();
    public List<string> SelectedProjectNames { get; set; } = new();
    public bool IsConnected { get; set; }
}
