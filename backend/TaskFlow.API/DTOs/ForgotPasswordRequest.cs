using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}