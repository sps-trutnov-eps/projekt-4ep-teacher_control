using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public class TeacherBingoService(AppDbContext db)
{
	private const int DefaultBoardSize = 3;

	public async Task<BingoBoardDto?> GetBoardAsync(string studentId, CancellationToken cancellationToken)
	{
		var board = await GetTodaysBoardQuery(studentId)
			.FirstOrDefaultAsync(cancellationToken);

		if (board is not null)
			return MapBoard(board, studentId);

		return await CreateBoardAsync(studentId, DefaultBoardSize, null, cancellationToken);
	}

	public async Task<BingoBoardDto?> CreateBoardAsync(
		string studentId,
		int requestedSize,
		IReadOnlyCollection<string>? teacherIds,
		CancellationToken cancellationToken)
	{
		var size = Math.Clamp(requestedSize, 2, 6);
		var selectedTeacherIds = new HashSet<int>();
		if (teacherIds is not null)
		{
			foreach (var teacherId in teacherIds)
			{
				if (!int.TryParse(teacherId, out var parsedTeacherId))
					return null;

				selectedTeacherIds.Add(parsedTeacherId);
			}
		}

		var quotesQuery = db.TeacherQuotes
			.Where(quote => quote.IsActive);
		if (teacherIds is not null)
			quotesQuery = quotesQuery.Where(quote => selectedTeacherIds.Contains(quote.TeacherId));

		var quotes = await quotesQuery.ToListAsync(cancellationToken);
		if (quotes.Count == 0)
			return null;

		var shuffledQuotes = quotes.OrderBy(_ => Random.Shared.Next()).ToArray();
		var board = new BingoBoardEntity
		{
			Quotes = Enumerable.Range(0, size * size)
				.Select(position => new BingoBoardQuoteEntity
				{
					Position = position,
					QuoteId = shuffledQuotes[position % shuffledQuotes.Length].Id,
					Quote = null!,
					BingoBoard = null!,
					BingoBoardId = 0
				})
				.ToList()
		};

		db.BingoBoards.Add(board);
		await db.SaveChangesAsync(cancellationToken);

		return await GetBoardByIdAsync(board.Id, studentId, cancellationToken);
	}

	public async Task<ToggleBingoCellDto?> ToggleCellAsync(
		string studentId,
		string cellId,
		CancellationToken cancellationToken)
	{
		if (!int.TryParse(cellId, out var boardQuoteId))
			return null;

		var boardQuote = await db.BingoBoardQuotes
			.Include(item => item.BingoBoard)
				.ThenInclude(board => board.Quotes)
					.ThenInclude(quote => quote.Marks.Where(mark => mark.StudentId == studentId))
			.Where(item => item.Id == boardQuoteId)
			.FirstOrDefaultAsync(cancellationToken);
		if (boardQuote is null)
			return null;

		var previousBingoCount = CalculateBingoCount(boardQuote.BingoBoard.Quotes, studentId);
		var userMark = boardQuote.Marks.FirstOrDefault(mark => mark.StudentId == studentId);
		if (userMark is null)
		{
			userMark = new BingoBoardQuoteMarkEntity
			{
				StudentId = studentId,
				Student = null!,
				BingoBoardQuoteId = boardQuote.Id,
				BingoBoardQuote = boardQuote
			};
			boardQuote.Marks.Add(userMark);
			db.BingoBoardQuoteMarks.Add(userMark);
		}
		else
		{
			boardQuote.Marks.Remove(userMark);
			db.BingoBoardQuoteMarks.Remove(userMark);
		}

		var currentBingoCount = CalculateBingoCount(boardQuote.BingoBoard.Quotes, studentId);
		var bingoDifference = currentBingoCount - previousBingoCount;

		var student = await db.Users.FirstAsync(user => user.Id == studentId, cancellationToken);
		student.FinishedBingoCount = Math.Max(0, student.FinishedBingoCount + bingoDifference);
		await db.SaveChangesAsync(cancellationToken);

		var board = await GetBoardByIdAsync(boardQuote.BingoBoardId, studentId, cancellationToken);
		return board is null
			? null
			: new ToggleBingoCellDto(board, bingoDifference > 0, student.FinishedBingoCount);
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
		return quotes.Select(MapQuote).ToArray();
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

	public async Task<UserBingoStatsDto> GetStatsAsync(string studentId, CancellationToken cancellationToken)
	{
		var student = await db.Users.FirstAsync(user => user.Id == studentId, cancellationToken);
		var boards = await db.BingoBoards
			.AsNoTracking()
			.Include(board => board.Quotes)
				.ThenInclude(quote => quote.Marks.Where(mark => mark.StudentId == studentId))
			.ToListAsync(cancellationToken);
		var completedBoards = boards.Count(board => IsBoardCompleted(board.Quotes, studentId));

		return new UserBingoStatsDto(studentId, student.FinishedBingoCount, completedBoards);
	}

	public async Task<UserBingoStatsDto> ResetStatsAsync(string studentId, CancellationToken cancellationToken)
	{
		var student = await db.Users.FirstAsync(user => user.Id == studentId, cancellationToken);
		student.FinishedBingoCount = 0;
		await db.SaveChangesAsync(cancellationToken);
		return await GetStatsAsync(studentId, cancellationToken);
	}

	private IQueryable<BingoBoardEntity> GetTodaysBoardQuery(string studentId)
	{
		var today = GetPragueDate();
		return db.BingoBoards
			.AsNoTracking()
			.Include(board => board.Quotes)
				.ThenInclude(item => item.Quote)
					.ThenInclude(quote => quote.Teacher)
			.Include(board => board.Quotes)
				.ThenInclude(item => item.Marks.Where(mark => mark.StudentId == studentId))
			.Where(board => board.Date == today)
			.OrderByDescending(board => board.Id);
	}

	private async Task<BingoBoardDto?> GetBoardByIdAsync(
		int boardId,
		string? studentId,
		CancellationToken cancellationToken)
	{
		var board = await db.BingoBoards
			.AsNoTracking()
			.Include(item => item.Quotes)
				.ThenInclude(item => item.Quote)
					.ThenInclude(quote => quote.Teacher)
			.Include(item => item.Quotes)
				.ThenInclude(item => item.Marks.Where(mark => mark.StudentId == studentId))
			.FirstOrDefaultAsync(item => item.Id == boardId, cancellationToken);
		return board is null ? null : MapBoard(board, studentId);
	}

	private static BingoBoardDto MapBoard(BingoBoardEntity board, string? studentId)
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
			studentId is not null && IsBoardCompleted(orderedQuotes, studentId),
			board.Date.ToDateTime(TimeOnly.MinValue).ToString("O"));
	}

	private static TeacherQuoteDto MapQuote(TeacherQuoteEntity quote) =>
		new(quote.Id.ToString(), quote.TeacherId.ToString(), quote.Teacher.Name, quote.Quote);

	private static int CalculateBingoCount(IEnumerable<BingoBoardQuoteEntity> boardQuotes, string studentId)
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

	private static bool IsBoardCompleted(IEnumerable<BingoBoardQuoteEntity> boardQuotes, string studentId)
	{
		var quotes = boardQuotes.ToArray();
		var size = (int)Math.Sqrt(quotes.Length);
		return size >= 2 && quotes.Length == size * size &&
			quotes.All(item => item.Marks.Any(mark => mark.StudentId == studentId));
	}

	private static DateOnly GetPragueDate() => DateOnly.FromDateTime(
		TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Europe/Prague"));
}

public sealed record TeacherQuoteDto(string Id, string TeacherId, string TeacherName, string Quote);
public sealed record BingoCellDto(string Id, int Row, int Col, TeacherQuoteDto Quote, bool IsMarked);
public sealed record BingoBoardDto(
	string Id,
	string UserId,
	int GridSize,
	IReadOnlyList<BingoCellDto> Cells,
	int BingoCount,
	bool IsCompleted,
	string CreatedAt);
public sealed record ToggleBingoCellDto(BingoBoardDto Board, bool NewBingoAchieved, int TotalBingos);
public sealed record UserBingoStatsDto(string UserId, int TotalBingos, int CompletedBoards);