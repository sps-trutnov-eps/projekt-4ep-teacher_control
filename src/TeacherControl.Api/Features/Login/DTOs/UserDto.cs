namespace TeacherControl.Api.Features.Login.DTOs;

public class UserDto
{
    public required string Id { get; set; }
    public required string DisplayName { get; set; }
    public required List<string> Roles { get; set; }
}
