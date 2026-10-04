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
        var today = DateOnly.FromDateTime(DateTime.Now);

        var teachers = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .ToListAsync();

        return teachers.Select(ToDto).ToList();
    }

    public async Task<TeacherAbstenceDto?> GetTeacherAsync(int teacherId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);

        var teacher = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .FirstOrDefaultAsync(t => t.Id == teacherId);

        return teacher is null ? null : ToDto(teacher);
    }

    public async Task<AbstenceWriteResult> SubmitLateArrivalAsync(int teacherId, string studentId, int minutes)
    {
        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);

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
            return new AbstenceWriteResult(AbstenceWriteOutcome.InternalError);

        // Přidáním do trackované navigační kolekce si EF entitu sám označí jako Added,
        // není potřeba volat i _context.LateArrivals.Add(...) zvlášť.
        teacher.LateArrivals.Add(new LateArrivalEntity
        {
            Date = today,
            TeacherId = teacherId,
            Teacher = teacher,
            StudentId = studentId,
            Student = student,
            TimeSpan = TimeSpan.FromMinutes(minutes)
        });
        teacher.LastSubmissionAt = now;

        await _context.SaveChangesAsync();

        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    public async Task<AbstenceWriteResult> SubmitMoodAsync(int teacherId, string studentId, float value)
    {
        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);

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
            return new AbstenceWriteResult(AbstenceWriteOutcome.InternalError);

        teacher.Mood = value;
        teacher.LastSubmissionAt = now;

        await _context.SaveChangesAsync();

        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    // Cooldown je sdílený mezi pozdním příchodem a náladou — odeslání jednoho z nich
    // resetuje časovač pro oba typy u daného učitele.
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
