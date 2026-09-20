using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Entities;

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
    public DbSet<BingoBoardEntity> BingoBoards { get; set; }
    
    // tabulka s hláškami konkrétního binga
    public DbSet<BingoBoardQuoteEntity> BingoBoardQuotes { get; set; }
}
