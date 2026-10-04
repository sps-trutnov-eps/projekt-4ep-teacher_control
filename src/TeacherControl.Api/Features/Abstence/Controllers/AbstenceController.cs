using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Abstence.Models;
using TeacherControl.Api.Features.Abstence.Services;

namespace TeacherControl.Api.Features.Abstence.Controllers;

[ApiController]
[Route("api/abstence")]
[Authorize]
public class AbstenceController : ControllerBase
{
    private readonly ILogger<AbstenceController> _logger;
    private readonly AbstenceService _abstenceService;
    private readonly UserManager<UserEntity> _userManager;

    public AbstenceController(ILogger<AbstenceController> logger, AbstenceService abstenceService, UserManager<UserEntity> userManager)
    {
        _logger = logger;
        _abstenceService = abstenceService;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<List<TeacherAbstenceDto>>> GetTeachers()
        => Ok(await _abstenceService.GetTeachersAsync());

    [HttpGet("{teacherId:int}")]
    public async Task<ActionResult<TeacherAbstenceDto>> GetTeacher(int teacherId)
    {
        var teacher = await _abstenceService.GetTeacherAsync(teacherId);
        if (teacher is null)
        {
            _logger.LogError("Učitel {TeacherId} nebyl nalezen", teacherId);
            return NotFound();
        }

        return Ok(teacher);
    }

    [HttpPost("{teacherId:int}/late-arrival")]
    public async Task<ActionResult<TeacherAbstenceDto>> SubmitLateArrival(int teacherId, [FromBody] SubmitLateArrivalRequest request)
    {
        if (request.Minutes <= 0)
        {
            _logger.LogError("Neplatný počet minut ({Minutes}) pro učitele {TeacherId}", request.Minutes, teacherId);
            return BadRequest("Minutes must be greater than zero.");
        }

        var userId = _userManager.GetUserId(User);
        if (userId is null)
        {
            _logger.LogError("Zápis pozdního příchodu pro učitele {TeacherId} odmítnut — chybí identita přihlášeného uživatele", teacherId);
            return Unauthorized();
        }

        var result = await _abstenceService.SubmitLateArrivalAsync(teacherId, userId, request.Minutes);
        return MapResult(teacherId, userId, result);
    }

    [HttpPost("{teacherId:int}/mood")]
    public async Task<ActionResult<TeacherAbstenceDto>> SubmitMood(int teacherId, [FromBody] SubmitMoodRequest request)
    {
        if (request.Value is < 1 or > 5)
        {
            _logger.LogError("Neplatná hodnota nálady ({Value}) pro učitele {TeacherId}", request.Value, teacherId);
            return BadRequest("Value must be between 1 and 5.");
        }

        var userId = _userManager.GetUserId(User);
        if (userId is null)
        {
            _logger.LogError("Zápis nálady pro učitele {TeacherId} odmítnut — chybí identita přihlášeného uživatele", teacherId);
            return Unauthorized();
        }

        var result = await _abstenceService.SubmitMoodAsync(teacherId, userId, request.Value);
        return MapResult(teacherId, userId, result);
    }

    private ActionResult<TeacherAbstenceDto> MapResult(int teacherId, string studentId, AbstenceWriteResult result)
    {
        switch (result.Outcome)
        {
            case AbstenceWriteOutcome.Success:
                return Ok(result.Teacher);
            case AbstenceWriteOutcome.TeacherNotFound:
                _logger.LogError("Učitel {TeacherId} nebyl nalezen", teacherId);
                return NotFound();
            case AbstenceWriteOutcome.TooSoon:
                _logger.LogError("Odeslání pro učitele {TeacherId} přišlo dřív, než uplynul cooldown (zbývá {RetryAfter})", teacherId, result.RetryAfter);
                return TooSoon(result.RetryAfter);
            case AbstenceWriteOutcome.InternalError:
                // Přihlášený uživatel by v DB měl vždy existovat — pokud ne, je to chyba na naší straně, ne 404.
                _logger.LogError("Přihlášený uživatel {StudentId} nebyl v DB nalezen při zápisu pro učitele {TeacherId}", studentId, teacherId);
                return StatusCode(StatusCodes.Status500InternalServerError);
            default:
                _logger.LogError("Neočekávaný výsledek zápisu {Outcome} pro učitele {TeacherId}", result.Outcome, teacherId);
                return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private ObjectResult TooSoon(TimeSpan? retryAfter)
    {
        if (retryAfter is { } wait)
            Response.Headers.RetryAfter = ((int)Math.Ceiling(wait.TotalSeconds)).ToString();

        return StatusCode(StatusCodes.Status429TooManyRequests,
            "A submission for this teacher was made less than 30 minutes ago.");
    }
}
