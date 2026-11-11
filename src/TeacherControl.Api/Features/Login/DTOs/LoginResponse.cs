namespace TeacherControl.Api.Features.Login.DTOs;

public class LoginResponse
{
    public required string Message { get; set; }
    public required UserDto User { get; set; }
}
