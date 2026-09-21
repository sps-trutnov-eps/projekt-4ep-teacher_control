using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using TeacherControl.Api.Common;

namespace TeacherControl.Api.Entities;

public class UserEntity : IdentityUser
{
    [MaxLength(50)]
    public string? FullName { get; set; } // username = windows login, FullName = actual jméno

    public int? Teacher { get; set; } = null;

    public UserRoles Role { get; set; } = UserRoles.User;
}
