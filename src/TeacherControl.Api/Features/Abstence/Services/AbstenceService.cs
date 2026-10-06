using System.Linq.Expressions;
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

        return await _context.Teachers
            .Select(BuildDtoProjection(today))
            .ToListAsync();
    }

    public async Task<TeacherAbstenceDto?> GetTeacherAsync(int teacherId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);

        return await _context.Teachers
            .Where(t => t.Id == teacherId)
            .Select(BuildDtoProjection(today))
            .FirstOrDefaultAsync();
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

        if (TryGetCooldownRemaining(teacher.LastLateArrivalSubmissionAt, now, out var remaining))
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
        teacher.LastLateArrivalSubmissionAt = now;

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

        if (TryGetCooldownRemaining(teacher.LastMoodSubmissionAt, now, out var remaining))
            return new AbstenceWriteResult(AbstenceWriteOutcome.TooSoon, RetryAfter: remaining);

        var student = await _context.Users.FindAsync(studentId);
        if (student is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.InternalError);

        teacher.Mood = value;
        teacher.LastMoodSubmissionAt = now;

        await _context.SaveChangesAsync();

        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    // Pozdní příchod a nálada mají od sebe nezávislé cooldowny — volá se zvlášť pro
    // LastLateArrivalSubmissionAt a zvlášť pro LastMoodSubmissionAt.
    private static bool TryGetCooldownRemaining(DateTime? lastSubmission, DateTime now, out TimeSpan remaining)
    {
        if (lastSubmission is { } last && now - last < SubmissionCooldown)
        {
            remaining = SubmissionCooldown - (now - last);
            return true;
        }

        remaining = TimeSpan.Zero;
        return false;
    }

    // Pro zápis (SubmitLateArrivalAsync/SubmitMoodAsync) už máme trackovanou entitu po uložení
    // v paměti, takže se mapuje přímo v C#, ne přes dotaz do DB.
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

    // Pro čtení (GetTeachersAsync/GetTeacherAsync) se mapuje přímo v dotazu, aby EF Core poslal
    // jen potřebná data (žádné Include + mapování v paměti).
    private static Expression<Func<TeacherEntity, TeacherAbstenceDto>> BuildDtoProjection(DateOnly today) => teacher =>
        new TeacherAbstenceDto(
            teacher.Id,
            teacher.Name,
            teacher.PhotoUrl,
            teacher.Reviews.Any() ? teacher.Reviews.Average(r => r.Rating) : (float?)null,
            teacher.Mood,
            (int)Math.Round(teacher.LateArrivals.Where(a => a.Date == today).Sum(a => a.TimeSpan.TotalMinutes)));
}
