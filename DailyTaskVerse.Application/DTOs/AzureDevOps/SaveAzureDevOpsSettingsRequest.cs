using System.ComponentModel.DataAnnotations;

namespace DailyTaskVerse.Application.DTOs.AzureDevOps;

public class SaveAzureDevOpsSettingsRequest
{
    [Required]
    public string OrganizationUrl { get; set; } = string.Empty;

    [Required]
    public string Pat { get; set; } = string.Empty;

    public List<string> SelectedProjectIds { get; set; } = new();
    public List<string> SelectedProjectNames { get; set; } = new();
}
