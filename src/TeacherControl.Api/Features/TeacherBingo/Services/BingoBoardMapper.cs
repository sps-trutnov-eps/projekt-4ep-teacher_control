using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.TeacherBingo.Models;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

internal static class BingoBoardMapper
{
    internal static BingoBoardDto Map(BingoBoardEntity board, string? studentId)
    {
        var orderedQuotes = board.Quotes.OrderBy(item => item.Position).ToArray();
        var size = (int)Math.Sqrt(orderedQuotes.Length);
        var cells = orderedQuotes.Select(item => new BingoCellDto(
            item.Id.ToString(),
            size == 0 ? 0 : item.Position / size,
            size == 0 ? 0 : item.Position % size,
            MapQuote(item.Quote),
            studentId is not null && item.Marks.Any(mark => mark.StudentId == studentId))).ToArray();
        var bingoCount = studentId is null ? 0 : CalculateBingoCount(orderedQuotes, studentId);

        return new BingoBoardDto(
            board.Id.ToString(),
            studentId ?? string.Empty,
            size,
            cells,
            bingoCount,
            studentId is not null && IsCompleted(orderedQuotes, studentId),
            board.Date.ToDateTime(TimeOnly.MinValue).ToString("O"));
    }

    internal static TeacherQuoteDto MapQuote(TeacherQuoteEntity quote) =>
        new(quote.Id.ToString(), quote.TeacherId.ToString(), quote.Teacher.Name, quote.Quote);

    internal static int CalculateBingoCount(IEnumerable<BingoBoardQuoteEntity> boardQuotes, string studentId)
    {
        var orderedQuotes = boardQuotes.OrderBy(item => item.Position).ToArray();
        var size = (int)Math.Sqrt(orderedQuotes.Length);
        if (size < 2 || orderedQuotes.Length != size * size)
            return 0;

        var marked = orderedQuotes.ToDictionary(
            item => item.Position,
            item => item.Marks.Any(mark => mark.StudentId == studentId));
        var count = 0;
        for (var index = 0; index < size; index++)
        {
            if (Enumerable.Range(0, size).All(column => marked[index * size + column]))
                count++;
            if (Enumerable.Range(0, size).All(row => marked[row * size + index]))
                count++;
        }

        if (Enumerable.Range(0, size).All(index => marked[index * size + index]))
            count++;
        if (Enumerable.Range(0, size).All(index => marked[index * size + size - index - 1]))
            count++;

        return count;
    }

    internal static bool IsCompleted(IEnumerable<BingoBoardQuoteEntity> boardQuotes, string studentId)
    {
        var quotes = boardQuotes.ToArray();
        var size = (int)Math.Sqrt(quotes.Length);
        return size >= 2 && quotes.Length == size * size &&
            quotes.All(item => item.Marks.Any(mark => mark.StudentId == studentId));
    }
}
