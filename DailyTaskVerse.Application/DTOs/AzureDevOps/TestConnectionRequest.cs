using System.ComponentModel.DataAnnotations;

namespace DailyTaskVerse.Application.DTOs.AzureDevOps;

public class TestConnectionRequest
{
    [Required]
    public string OrganizationUrl { get; set; } = string.Empty;

    [Required]
    public string Pat { get; set; } = string.Empty;
}
