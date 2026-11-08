using Microsoft.EntityFrameworkCore;

using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.TeacherBingo.Models;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public sealed partial class TeacherBingoService
{
    public async Task<IReadOnlyList<BingoTeacherDto>> GetTeachersAsync(CancellationToken cancellationToken)
    {
        return await db.Teachers
            .AsNoTracking()
            .OrderBy(teacher => teacher.Name)
            .Select(teacher => new BingoTeacherDto(teacher.Id.ToString(), teacher.Name))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TeacherQuoteDto>> GetQuotesAsync(
        int? teacherId,
        CancellationToken cancellationToken)
    {
        var query = db.TeacherQuotes
            .AsNoTracking()
            .Include(quote => quote.Teacher)
            .Where(quote => quote.IsActive);
        if (teacherId.HasValue)
            query = query.Where(quote => quote.TeacherId == teacherId.Value);

        var quotes = await query.OrderBy(quote => quote.Id).ToListAsync(cancellationToken);
        return quotes.Select(BingoBoardMapper.MapQuote).ToArray();
    }

    public async Task<TeacherQuoteDto?> CreateQuoteAsync(
        int teacherId,
        string text,
        CancellationToken cancellationToken)
    {
        var teacher = await db.Teachers.FindAsync([teacherId], cancellationToken);
        if (teacher is null)
            return null;

        var quote = new TeacherQuoteEntity
        {
            Quote = text.Trim(),
            TeacherId = teacherId,
            Teacher = teacher
        };
        db.TeacherQuotes.Add(quote);
        await db.SaveChangesAsync(cancellationToken);

        return new TeacherQuoteDto(quote.Id.ToString(), teacherId.ToString(), teacher.Name, quote.Quote);
    }
}
