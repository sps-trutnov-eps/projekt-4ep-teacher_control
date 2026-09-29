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

    /// <summary>
    /// feat/recenze
    /// </summary>
    public DbSet<ReviewEntity> Reviews { get; set; }

    /// <summary>
    /// feat/abstence
    /// </summary>
    public DbSet<LateArrivalEntity> LateArrivals { get; set; }

    /// <summary>
    /// feat/bingo
    /// </summary>
    public DbSet<TeacherQuoteEntity> TeacherQuotes { get; set; }
    public DbSet<BingoBoardEntity> BingoBoards { get; set; }
    // tabulka s hláškami konkrétního binga
    public DbSet<BingoBoardQuoteEntity> BingoBoardQuotes { get; set; }

    /// <summary>
    /// feat/pololeti
    /// </summary>
    public DbSet<TeacherTitleEntity> TeacherTitles { get; set; }
    public DbSet<TitleVoteEntity> TitleVotes { get; set; }
    public DbSet<HistoricTitleEntity> HistoricTitles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TitleVoteEntity>()
            .HasKey(v => new { v.StudentId, v.TeacherTitleId, v.Pololeti });

        modelBuilder.Entity<BingoBoardQuoteEntity>()
            .HasIndex(q => new { q.BingoBoardId, q.Position }).IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasOne(u => u.Teacher).WithOne()
            .HasForeignKey<UserEntity>(u => u.TeacherId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ReviewEntity>()
            .HasOne(r => r.Teacher).WithMany(t => t.Reviews)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<ReviewEntity>()
            .HasOne(r => r.Student).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<LateArrivalEntity>()
            .HasOne(a => a.Teacher).WithMany(t => t.LateArrivals)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<LateArrivalEntity>()
            .HasOne(a => a.Student).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TeacherQuoteEntity>()
            .HasOne(q => q.Teacher).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<BingoBoardEntity>()
            .HasOne(b => b.Student).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<BingoBoardQuoteEntity>()
            .HasOne(q => q.Quote).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<BingoBoardQuoteEntity>()
            .HasOne(q => q.BingoBoard).WithMany(b => b.Quotes)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TitleVoteEntity>()
            .HasOne(v => v.Student).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TitleVoteEntity>()
            .HasOne(v => v.Teacher).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TitleVoteEntity>()
            .HasOne(v => v.TeacherTitle).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<HistoricTitleEntity>()
            .HasOne(h => h.TeacherTitle).WithMany().OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<HistoricTitleEntity>()
            .HasOne(h => h.WinningTeacher).WithMany().OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ReviewEntity>().ToTable(t =>
            t.HasCheckConstraint("CK_Reviews_Rating", "\"Rating\" BETWEEN 1 AND 5"));
        modelBuilder.Entity<TeacherEntity>().ToTable(t =>
            t.HasCheckConstraint("CK_Teachers_Mood", "\"Mood\" BETWEEN 1 AND 5"));
        modelBuilder.Entity<LateArrivalEntity>().ToTable(t =>
            t.HasCheckConstraint("CK_LateArrivals_Duration", "\"TimeSpan\" >= INTERVAL '0 seconds'"));
        modelBuilder.Entity<BingoBoardQuoteEntity>().ToTable(t =>
            t.HasCheckConstraint("CK_BingoBoardQuotes_Position", "\"Position\" >= 0"));
        modelBuilder.Entity<TitleVoteEntity>().ToTable(t =>
            t.HasCheckConstraint("CK_TitleVotes_Pololeti", "\"Pololeti\" >= 0"));
        modelBuilder.Entity<HistoricTitleEntity>().ToTable(t =>
            t.HasCheckConstraint("CK_HistoricTitles_Pololeti", "\"Pololeti\" >= 0"));
    }
}
