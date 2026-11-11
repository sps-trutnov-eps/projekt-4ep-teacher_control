using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Login.DTOs;

public class ResendCodeRequest
{
    [Required(ErrorMessage = "E-mail je povinný.")]
    [EmailAddress(ErrorMessage = "Zadejte platnou e-mailovou adresu.")]
    public required string Email { get; set; }
}
