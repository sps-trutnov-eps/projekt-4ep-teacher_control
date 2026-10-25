namespace TeacherControl.Api.Features.Login.DTOs;

public class ConfirmCodeResponse
{
    public required string Message { get; set; }
    public required UserDto User { get; set; }
}
