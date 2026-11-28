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

    // Vrací null, pokud učitel neexistuje.
    public async Task<List<LateArrivalRecordDto>?> GetLateArrivalsAsync(int teacherId)
    {
        if (!await _context.Teachers.AnyAsync(t => t.Id == teacherId))
            return null;

        var arrivals = await _context.LateArrivals
            .Where(a => a.TeacherId == teacherId)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.Id)
            .Select(a => new { a.Date, a.TimeSpan })
            .ToListAsync();

        return arrivals
            .Select(a => new LateArrivalRecordDto(a.Date, (int)Math.Round(a.TimeSpan.TotalMinutes)))
            .ToList();
    }

    public async Task<AbstenceWriteResult> SubmitLateArrivalAsync(int teacherId, string studentId, int minutes)
    {
        // Časové razítko do timestamptz musí být UTC (Npgsql odmítne Kind=Local); "today" je školní den v lokálním čase.
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(DateTime.Now);

        if (!await _context.Teachers.AnyAsync(t => t.Id == teacherId))
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        var student = await _context.Users.FindAsync(studentId);
        if (student is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.InternalError);

        // Zámek se bere jedním podmíněným UPDATE (kontrola cooldownu i zápis času v jednom kroku)
        // a řádek učitele zůstane zamčený do commitu. Souběžný požadavek proto počká a po commitu
        // už podmínku nesplní, takže se stejné zpoždění nikdy nezapíše dvakrát. Pokud zápis záznamu
        // selže, transakce se vrátí a zámek se neodčerpá.
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var cutoff = now - SubmissionCooldown;
        var claimed = await _context.Teachers
            .Where(t => t.Id == teacherId
                        && (t.LastLateArrivalSubmissionAt == null || t.LastLateArrivalSubmissionAt <= cutoff))
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.LastLateArrivalSubmissionAt, now));
        if (claimed == 0)
            return await RejectAsync(teacherId, t => t.LastLateArrivalSubmissionAt, now);

        var teacher = await _context.Teachers
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .FirstAsync(t => t.Id == teacherId);

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

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    public async Task<AbstenceWriteResult> SubmitMoodAsync(int teacherId, string studentId, float value)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(DateTime.Now);

        if (!await _context.Teachers.AnyAsync(t => t.Id == teacherId))
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        var student = await _context.Users.FindAsync(studentId);
        if (student is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.InternalError);

        // Jeden atomický UPDATE: kontrola cooldownu, zápis nálady i času zápisu najednou.
        var cutoff = now - SubmissionCooldown;
        var claimed = await _context.Teachers
            .Where(t => t.Id == teacherId
                        && (t.LastMoodSubmissionAt == null || t.LastMoodSubmissionAt <= cutoff))
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.Mood, value)
                .SetProperty(t => t.LastMoodSubmissionAt, now));
        if (claimed == 0)
            return await RejectAsync(teacherId, t => t.LastMoodSubmissionAt, now);

        var teacher = await _context.Teachers
            .AsNoTracking()
            .Include(t => t.Reviews)
            .Include(t => t.LateArrivals.Where(a => a.Date == today))
            .FirstAsync(t => t.Id == teacherId);

        return new AbstenceWriteResult(AbstenceWriteOutcome.Success, ToDto(teacher));
    }

    // Pozdní příchod a nálada mají od sebe nezávislé cooldowny — volající říká, který čas
    // (LastLateArrivalSubmissionAt / LastMoodSubmissionAt) se má použít pro zbývající dobu.
    private async Task<AbstenceWriteResult> RejectAsync(
        int teacherId, Func<TeacherEntity, DateTime?> lastSubmission, DateTime now)
    {
        var teacher = await _context.Teachers.AsNoTracking().FirstOrDefaultAsync(t => t.Id == teacherId);
        if (teacher is null)
            return new AbstenceWriteResult(AbstenceWriteOutcome.TeacherNotFound);

        var remaining = lastSubmission(teacher) is { } last
            ? SubmissionCooldown - (now - last)
            : TimeSpan.Zero;
        if (remaining < TimeSpan.Zero)
            remaining = TimeSpan.Zero;

        return new AbstenceWriteResult(AbstenceWriteOutcome.TooSoon, RetryAfter: remaining);
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
