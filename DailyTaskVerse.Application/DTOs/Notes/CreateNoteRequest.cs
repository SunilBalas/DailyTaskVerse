using System.ComponentModel.DataAnnotations;

namespace DailyTaskVerse.Application.DTOs.Notes;

public class CreateNoteRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public bool IsPinned { get; set; }
}
