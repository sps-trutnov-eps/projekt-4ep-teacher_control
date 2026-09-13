using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using TeacherControl.Api.Common;

namespace TeacherControl.Api.Entities;

public class UserEntity : IdentityUser
{
    [MaxLength(50)]
    public string? FullName { get; set; } // username = windows login, FullName = actual jméno

    /// <summary>
    /// Lze zjistit tak, že UserName obsahuje čísla.
    /// </summary>
    public bool IsTeacher { get; set; } = false;

    public UserRoles Role { get; set; } = UserRoles.User;
}
