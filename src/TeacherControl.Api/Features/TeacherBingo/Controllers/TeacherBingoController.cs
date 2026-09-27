using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.TeacherBingo.Services;

namespace TeacherControl.Api.Features.TeacherBingo.Controllers;

[ApiController]
[Route("api/bingo")]
public class TeacherBingoController : ControllerBase
{
    private readonly ILogger<TeacherBingoController> _logger;
    private readonly TeacherBingoService _teacherBingoService;

    public TeacherBingoController(ILogger<TeacherBingoController> logger, TeacherBingoService teacherBingoService)
    {
        _logger = logger;
        _teacherBingoService = teacherBingoService;
    }

    [HttpGet("board")]
    public ActionResult<BingoBoard> GetBoard()
    {
        var board = _teacherBingoService.GetOrCreateBoard(GetCurrentUserId());
        return Ok(board);
    }

    [HttpPost("board/new")]
    public ActionResult<BingoBoard> CreateBoard([FromQuery] int? size)
    {
        var board = _teacherBingoService.CreateBoard(GetCurrentUserId(), size ?? 3);
        return StatusCode(StatusCodes.Status201Created, board);
    }

    [HttpPost("cells/{cellId}/toggle")]
    public ActionResult<ToggleCellResponse> ToggleCell(string cellId)
    {
        try
        {
            var response = _teacherBingoService.ToggleCell(GetCurrentUserId(), cellId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { title = ex.Message, status = StatusCodes.Status404NotFound });
        }
    }

    [HttpGet("quotes")]
    public ActionResult<IReadOnlyList<TeacherQuote>> GetQuotes([FromQuery] string? teacherId)
    {
        var quotes = _teacherBingoService.GetQuotes(teacherId);
        return Ok(quotes);
    }

    [HttpPost("quotes")]
    public ActionResult<TeacherQuote> CreateQuote([FromBody] CreateQuoteRequest request)
    {
        try
        {
            var quote = _teacherBingoService.CreateQuote(request);
            return StatusCode(StatusCodes.Status201Created, quote);
        }
        catch (ArgumentException ex)
        {
            return ValidationProblem(new ValidationProblemDetails
            {
                Title = ex.Message,
                Status = StatusCodes.Status400BadRequest,
            });
        }
    }

    [HttpGet("stats")]
    public ActionResult<UserBingoStats> GetStats()
    {
        var stats = _teacherBingoService.GetStats(GetCurrentUserId());
        return Ok(stats);
    }

    [HttpPost("stats/reset")]
    public ActionResult<UserBingoStats> ResetStats()
    {
        var stats = _teacherBingoService.ResetStats(GetCurrentUserId());
        return Ok(stats);
    }

    private string GetCurrentUserId()
    {
        var nameIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return string.IsNullOrWhiteSpace(nameIdentifier) ? "u-student" : nameIdentifier;
    }
}