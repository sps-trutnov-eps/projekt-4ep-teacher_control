using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.Rating.DTOs;
using TeacherControl.Api.Features.Rating.Services;

namespace TeacherControl.Api.Features.Rating.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingController : ControllerBase
{
    private readonly ILogger<RatingController> _logger;
    private readonly RatingService _ratingService;

    public RatingController(ILogger<RatingController> logger, RatingService ratingService)
    {
        _logger = logger;
        _ratingService = ratingService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        try
        {
            var result = await _ratingService.CreateReviewAsync(studentId, request);
            return CreatedAtAction(nameof(GetReviewsForTeacher), new { teacherId = result.TeacherId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Attempted to review a non-existent teacher");
            return NotFound(ex.Message);
        }
    }

    [HttpGet("teacher/{teacherId:int}")]
    public async Task<IActionResult> GetReviewsForTeacher(int teacherId)
    {
        var reviews = await _ratingService.GetReviewsForTeacherAsync(teacherId);
        return Ok(reviews);
    }

    [HttpGet("teacher/{teacherId:int}/average")]
    public async Task<IActionResult> GetAverageRating(int teacherId)
    {
        var average = await _ratingService.GetAverageRatingAsync(teacherId);
        return Ok(average);
    }
}
