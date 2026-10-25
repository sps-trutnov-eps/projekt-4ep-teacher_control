using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Login.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "E-mail je povinný.")]
    [EmailAddress(ErrorMessage = "Zadejte platnou e-mailovou adresu.")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Heslo je povinné.")]
    public required string Password { get; set; }
}
