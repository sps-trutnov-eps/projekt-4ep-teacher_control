using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Login.DTOs;

public class ConfirmCodeRequest
{
    [Required(ErrorMessage = "E-mail je povinný.")]
    [EmailAddress(ErrorMessage = "Zadejte platnou e-mailovou adresu.")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Potvrzovací kód je povinný.")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Potvrzovací kód se skládá ze 6 číslic.")]
    public required string Code { get; set; }
}
