using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using TeacherControl.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace TeacherControl.Api.Data;

public class AppDbContext : IdentityDbContext<UserEntity>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}
