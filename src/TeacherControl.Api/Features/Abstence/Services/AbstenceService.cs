using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Abstence.Models;

namespace TeacherControl.Api.Features.Abstence.Services;

public class AbstenceService
{
    private static readonly TimeSpan SubmissionCooldown = TimeSpan.FromMinutes(30);

    private readonly AppDbContext _context;

    public AbstenceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TeacherAbstenceDto>> GetTeachersAsync()
    {
        var today = DateTime.Now.Date;

        var teachers = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .ToListAsync();

        return teachers.Select(ToDto).ToList();
    }

    public async Task<TeacherAbstenceDto?> GetTeacherAsync(int teacherId)
    {
        var today = DateTime.Now.Date;

        var teacher = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        return teacher is null ? null : ToDto(teacher);
    }

    public async Task<AbstenceWriteResult> SubmitLateArrivalAsync(int teacherId, string studentId, int minutes)
    {
        var now = DateTime.Now;
        var today = now.Date;

        var teacher = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .FirstOrDefaultAsync(t => t.Id == teacherId);
        if (teacher is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        if (TryGetCooldownRemaining(teacher, now, out var remaining))
            return new AbstenceWriteResult(AbstenceWriteOutcome.TooSoon, RetryAfter: remaining);

        var student = await _context.Users.FindAsync(studentId);
        if (student is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        var entry = new LateArrivalEntity
        {
            Date = today,
            TeacherId = teacherId,
            Teacher = teacher,
            StudentId = studentId,
            Student = student,
            TimeSpan = TimeSpan.FromMinutes(minutes),
        };
        _context.LateArrivals.Add(entry);
        teacher.LastSubmissionAt = now;

        await _context.SaveChangesAsync();

        teacher.LateArrivals.Add(entry);
        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    public async Task<AbstenceWriteResult> SubmitMoodAsync(int teacherId, string studentId, float value)
    {
        var now = DateTime.Now;
        var today = now.Date;

        var teacher = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .FirstOrDefaultAsync(t => t.Id == teacherId);
        if (teacher is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        if (TryGetCooldownRemaining(teacher, now, out var remaining))
            return new AbstenceWriteResult(AbstenceWriteOutcome.TooSoon, RetryAfter: remaining);

        var student = await _context.Users.FindAsync(studentId);
        if (student is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        teacher.Mood = value;
        teacher.LastSubmissionAt = now;

        await _context.SaveChangesAsync();

        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    // Cooldown is shared between late-arrival and mood submissions — either one resets it for the teacher.
    private static bool TryGetCooldownRemaining(TeacherEntity teacher, DateTime now, out TimeSpan remaining)
    {
        if (teacher.LastSubmissionAt is { } last && now - last < SubmissionCooldown)
        {
            remaining = SubmissionCooldown - (now - last);
            return true;
        }

        remaining = TimeSpan.Zero;
        return false;
    }

    private static TeacherAbstenceDto ToDto(TeacherEntity teacher)
    {
        var rating = teacher.Reviews.Count > 0 ? teacher.Reviews.Average(r => r.Rating) : (float?)null;
        var lateMinutesToday = teacher.LateArrivals.Sum(a => a.TimeSpan.TotalMinutes);

        return new TeacherAbstenceDto(
            teacher.Id,
            teacher.Name,
            teacher.PhotoUrl,
            rating,
            teacher.Mood,
            (int)Math.Round(lateMinutesToday));
    }
}
