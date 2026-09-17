using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace TeacherControl.Api.Entities;

public class UserEntity : IdentityUser
{
    [MaxLength(50)]
    public string? FullName { get; set; } // username = windows login, FullName = actual jméno

    public int? TeacherId { get; set; } = null;
    public TeacherEntity? Teacher { get; set; }

    public required int FinishedBingoCount { get; set; } = 0;
}
