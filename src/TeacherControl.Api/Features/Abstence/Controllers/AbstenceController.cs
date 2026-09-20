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
        return teacher is null ? NotFound() : Ok(teacher);
    }

    [HttpPost("{teacherId:int}/late-arrival")]
    public async Task<ActionResult<TeacherAbstenceDto>> SubmitLateArrival(int teacherId, [FromBody] SubmitLateArrivalRequest request)
    {
        if (request.Minutes <= 0)
            return BadRequest("Minutes must be greater than zero.");

        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var result = await _abstenceService.SubmitLateArrivalAsync(teacherId, userId, request.Minutes);
        return MapResult(result);
    }

    [HttpPost("{teacherId:int}/mood")]
    public async Task<ActionResult<TeacherAbstenceDto>> SubmitMood(int teacherId, [FromBody] SubmitMoodRequest request)
    {
        if (request.Value is < 1 or > 5)
            return BadRequest("Value must be between 1 and 5.");

        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var result = await _abstenceService.SubmitMoodAsync(teacherId, userId, request.Value);
        return MapResult(result);
    }

    private ActionResult<TeacherAbstenceDto> MapResult(AbstenceWriteResult result) => result.Outcome switch
    {
        AbstenceWriteOutcome.Success => Ok(result.Teacher),
        AbstenceWriteOutcome.TeacherNotFound => NotFound(),
        AbstenceWriteOutcome.TooSoon => TooSoon(result.RetryAfter),
        _ => StatusCode(StatusCodes.Status500InternalServerError),
    };

    private ObjectResult TooSoon(TimeSpan? retryAfter)
    {
        if (retryAfter is { } wait)
            Response.Headers["Retry-After"] = ((int)Math.Ceiling(wait.TotalSeconds)).ToString();

        return StatusCode(StatusCodes.Status429TooManyRequests,
            "A submission for this teacher was made less than 30 minutes ago.");
    }
}
