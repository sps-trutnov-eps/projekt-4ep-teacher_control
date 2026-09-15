using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using TeacherControl.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace TeacherControl.Api.Data;

public class AppDbContext : IdentityDbContext<UserEntity>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    public DbSet<TeacherEntity> Teachers { get; set; }
    public DbSet<AwardEntity> Awards { get; set; }
    public DbSet<ReviewEntity> Reviews { get; set; }
    public DbSet<LateArrivalEntity> LateArrivals { get; set; }
    public DbSet<TeacherQuoteEntity> TeacherQuotes { get; set; }
    
}
