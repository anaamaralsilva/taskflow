using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs;

public class CreateTaskRequest
{
    [Required]
    [MinLength(2)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Pending";

    [Required]
    public DateTime DueDate { get; set; }

    [Required]
    public int ProjectId { get; set; }
}