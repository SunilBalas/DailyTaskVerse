namespace DailyTaskVerse.Domain.Entities;

public class AzureDevOpsSettings
{
    public Guid Id { get; set; }
    public string OrganizationUrl { get; set; } = string.Empty;
    public string EncryptedPat { get; set; } = string.Empty;
    public string? SelectedProjectIds { get; set; }
    public string? SelectedProjectNames { get; set; }
    public bool IsConnected { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
