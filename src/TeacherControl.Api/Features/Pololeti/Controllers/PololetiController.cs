using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Pololeti.Models;
using TeacherControl.Api.Features.Pololeti.Services;

namespace TeacherControl.Api.Features.Pololeti.Controllers;

[ApiController]
[Route("api/pololeti")]
public class PololetiController : ControllerBase
{
    private readonly ILogger<PololetiController> _logger;
    private readonly PololetiService _pololetiService;
    private readonly UserManager<UserEntity> _userManager;

    public PololetiController(ILogger<PololetiController> logger, PololetiService pololetiService, UserManager<UserEntity> userManager)
    {
        _logger = logger;
        _pololetiService = pololetiService;
        _userManager = userManager;
    }

    [HttpGet("teachers")]
    public async Task<ActionResult<List<PololetiTeacherDto>>> GetTeachers()
        => Ok(await _pololetiService.GetTeachersAsync());

    // Čtení je veřejné; přihlášenému uživateli se navíc vyplní, komu dal o který titul hlas.
    [HttpGet("teachers/{teacherId:int}")]
    public async Task<ActionResult<TeacherCardDto>> GetTeacher(int teacherId)
    {
        var teacher = await _pololetiService.GetTeacherCardAsync(teacherId, _userManager.GetUserId(User));
        if (teacher is null)
        {
            _logger.LogError("Učitel {TeacherId} nebyl nalezen", teacherId);
            return NotFound();
        }

        return Ok(teacher);
    }

    [Authorize]
    [HttpPost("teachers/{teacherId:int}/votes")]
    public async Task<ActionResult<TeacherCardDto>> Vote(int teacherId, [FromBody] CastVoteRequest request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
        {
            _logger.LogError("Hlas pro učitele {TeacherId} odmítnut — chybí identita přihlášeného uživatele", teacherId);
            return Unauthorized();
        }

        var result = await _pololetiService.VoteAsync(teacherId, userId, request.TeacherTitleId);
        switch (result.Outcome)
        {
            case VoteOutcome.Success:
                return Ok(result.Teacher);
            case VoteOutcome.TeacherNotFound:
                _logger.LogError("Učitel {TeacherId} nebyl nalezen", teacherId);
                return NotFound();
            case VoteOutcome.TitleNotFound:
                _logger.LogError("Titul {TeacherTitleId} nebyl nalezen", request.TeacherTitleId);
                return NotFound();
            case VoteOutcome.Conflict:
                _logger.LogError("Souběžný hlas uživatele {UserId} o titul {TeacherTitleId}", userId, request.TeacherTitleId);
                return Conflict();
            case VoteOutcome.InternalError:
                _logger.LogError("Přihlášený uživatel {UserId} nebyl v DB nalezen při hlasování pro učitele {TeacherId}", userId, teacherId);
                return StatusCode(StatusCodes.Status500InternalServerError);
            default:
                _logger.LogError("Neočekávaný výsledek hlasování {Outcome} pro učitele {TeacherId}", result.Outcome, teacherId);
                return StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}
