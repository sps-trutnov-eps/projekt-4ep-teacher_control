using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.TeacherBingo.Services;

namespace TeacherControl.Api.Features.TeacherBingo.Controllers;

[ApiController]
[Authorize]
[Route("api/bingo")]
public class TeacherBingoController : ControllerBase
{
    private readonly TeacherBingoService _teacherBingoService;

    public TeacherBingoController(TeacherBingoService teacherBingoService)
    {
        _teacherBingoService = teacherBingoService;
    }

    [HttpGet("board")]
    public async Task<ActionResult<BingoBoardDto>> GetBoard(CancellationToken cancellationToken)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        var board = await _teacherBingoService.GetBoardAsync(studentId, cancellationToken);
        return board is null
            ? Conflict(new ProblemDetails { Status = StatusCodes.Status409Conflict, Title = "No active bingo quotes are available." })
            : Ok(board);
    }

    [HttpPost("board/new")]
    public async Task<ActionResult<BingoBoardDto>> CreateBoard(
        [FromBody] CreateBingoBoardRequest request,
        CancellationToken cancellationToken)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        if (request.Size is < 2 or > 6)
            return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Board size must be between 2 and 6." });

        var board = await _teacherBingoService.CreateBoardAsync(
            studentId, request.Size, request.TeacherIds, cancellationToken);
        if (board is null)
            return Conflict(new ProblemDetails { Status = StatusCodes.Status409Conflict, Title = "No active quotes match the selected teachers." });

        return StatusCode(StatusCodes.Status201Created, board);
    }

    [HttpPost("cells/{cellId}/toggle")]
    public async Task<ActionResult<ToggleBingoCellDto>> ToggleCell(
        string cellId,
        CancellationToken cancellationToken)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        var result = await _teacherBingoService.ToggleCellAsync(studentId, cellId, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("quotes")]
    public async Task<ActionResult<IReadOnlyList<TeacherQuoteDto>>> GetQuotes(
        [FromQuery] string? teacherId,
        CancellationToken cancellationToken)
    {
        if (teacherId is not null && !int.TryParse(teacherId, out _))
            return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Teacher ID must be an integer." });

        int? parsedTeacherId = teacherId is null ? null : int.Parse(teacherId);
        return Ok(await _teacherBingoService.GetQuotesAsync(parsedTeacherId, cancellationToken));
    }

    [HttpPost("quotes")]
    public async Task<ActionResult<TeacherQuoteDto>> CreateQuote(
        [FromBody] CreateTeacherQuoteRequest request,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(request.TeacherId, out var teacherId) || string.IsNullOrWhiteSpace(request.Quote))
            return BadRequest(new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "A valid teacher ID and quote are required." });

        var quote = await _teacherBingoService.CreateQuoteAsync(teacherId, request.Quote, cancellationToken);
        return quote is null ? NotFound() : StatusCode(StatusCodes.Status201Created, quote);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserBingoStatsDto>> GetStats(CancellationToken cancellationToken)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        return Ok(await _teacherBingoService.GetStatsAsync(studentId, cancellationToken));
    }

    [HttpPost("stats/reset")]
    public async Task<ActionResult<UserBingoStatsDto>> ResetStats(CancellationToken cancellationToken)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        return Ok(await _teacherBingoService.ResetStatsAsync(studentId, cancellationToken));
    }
}

public sealed record CreateBingoBoardRequest(int Size = 3, IReadOnlyCollection<string>? TeacherIds = null);
public sealed record CreateTeacherQuoteRequest(string TeacherId, string TeacherName, string Quote);