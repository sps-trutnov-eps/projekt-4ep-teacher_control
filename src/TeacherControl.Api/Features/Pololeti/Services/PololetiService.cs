using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Pololeti.Models;

namespace TeacherControl.Api.Features.Pololeti.Services;

public class PololetiService
{
    private readonly AppDbContext _context;

    public PololetiService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PololetiTeacherDto>> GetTeachersAsync()
        => await _context.Teachers
            .OrderBy(t => t.Name)
            .Select(t => new PololetiTeacherDto(t.Id, t.Name, t.PhotoUrl))
            .ToListAsync();

    public async Task<TeacherCardDto?> GetTeacherCardAsync(int teacherId, string? userId)
    {
        var pololeti = GetCurrentPololeti(DateTime.Now);

        var teacher = await _context.Teachers
            .Where(t => t.Id == teacherId)
            .Select(t => new { t.Id, t.Name, t.PhotoUrl, t.Description })
            .FirstOrDefaultAsync();
        if (teacher is null)
            return null;

        var titles = await _context.TeacherTitles
            .OrderBy(t => t.Id)
            .Select(t => new { t.Id, t.Title })
            .ToListAsync();

        var voteCounts = await _context.TitleVotes
            .Where(v => v.TeacherId == teacherId && v.Pololeti == pololeti)
            .GroupBy(v => v.TeacherTitleId)
            .Select(g => new { TeacherTitleId = g.Key, Votes = g.Count() })
            .ToDictionaryAsync(g => g.TeacherTitleId, g => g.Votes);

        var myVotes = userId is null
            ? new Dictionary<int, int>()
            : await _context.TitleVotes
                .Where(v => v.StudentId == userId && v.Pololeti == pololeti)
                .ToDictionaryAsync(v => v.TeacherTitleId, v => v.TeacherId);

        return new TeacherCardDto(
            teacher.Id,
            teacher.Name,
            teacher.PhotoUrl,
            teacher.Description,
            pololeti,
            GetPololetiText(pololeti),
            titles.Select(t => new TitleVotesDto(
                t.Id,
                t.Title,
                voteCounts.GetValueOrDefault(t.Id),
                myVotes.TryGetValue(t.Id, out var votedTeacherId) ? votedTeacherId : null)).ToList());
    }

    // Uživatel má v pololetí jeden hlas na titul (primární klíč TitleVotes). Když o stejný titul
    // hlasuje znovu, hlas se přesune na nově vybraného učitele.
    public async Task<VoteResult> VoteAsync(int teacherId, string userId, int teacherTitleId)
    {
        var pololeti = GetCurrentPololeti(DateTime.Now);

        var teacher = await _context.Teachers.FindAsync(teacherId);
        if (teacher is null)
            return new VoteResult(VoteOutcome.TeacherNotFound);

        var title = await _context.TeacherTitles.FindAsync(teacherTitleId);
        if (title is null)
            return new VoteResult(VoteOutcome.TitleNotFound);

        var student = await _context.Users.FindAsync(userId);
        if (student is null)
            return new VoteResult(VoteOutcome.InternalError);

        var vote = await _context.TitleVotes.FirstOrDefaultAsync(v =>
            v.StudentId == userId && v.TeacherTitleId == teacherTitleId && v.Pololeti == pololeti);
        if (vote is null)
        {
            _context.TitleVotes.Add(new TitleVoteEntity
            {
                StudentId = userId,
                Student = student,
                TeacherTitleId = teacherTitleId,
                TeacherTitle = title,
                TeacherId = teacherId,
                Teacher = teacher,
                Pololeti = pololeti
            });
        }
        else
        {
            vote.TeacherId = teacherId;
            vote.Teacher = teacher;
            vote.VotedOn = DateTime.UtcNow;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return new VoteResult(VoteOutcome.Conflict);
        }

        return new VoteResult(VoteOutcome.Success, await GetTeacherCardAsync(teacherId, userId));
    }

    // Číslování pololetí je stejné jako u HistoricTitleEntity: 0 = první pololetí 2026/2027.
    // První pololetí bereme od září do ledna, druhé od února do srpna.
    private static int GetCurrentPololeti(DateTime now)
    {
        var schoolYearStart = now.Month >= 9 ? now.Year : now.Year - 1;
        var isFirstHalf = now.Month is >= 9 or 1;

        var pololeti = (schoolYearStart - HistoricTitleEntity.StartYear) * 2 + (isFirstHalf ? 0 : 1);
        return Math.Max(pololeti, 0);
    }

    private static string GetPololetiText(int pololeti)
    {
        var startYear = HistoricTitleEntity.StartYear + pololeti / 2;
        return $"{startYear}/{startYear + 1} – {pololeti % 2 + 1}. pololetí";
    }
}
