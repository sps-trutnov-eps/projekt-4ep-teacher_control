using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Login.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "E-mail je povinný.")]
    [EmailAddress(ErrorMessage = "Zadejte platnou e-mailovou adresu.")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Heslo je povinné.")]
    [MinLength(8, ErrorMessage = "Heslo musí mít alespoň 8 znaků.")]
    public required string Password { get; set; }
}
