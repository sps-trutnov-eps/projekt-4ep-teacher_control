using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.Rating.DTOs;
using TeacherControl.Api.Features.Rating.Services;

namespace TeacherControl.Api.Features.Rating.Controllers;

[ApiController]
[Route("api/rating")]
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
    [ProducesResponseType(typeof(ReviewResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (studentId is null)
            return Unauthorized();

        try
        {
            var result = await _ratingService.CreateReviewAsync(studentId, request);
            return CreatedAtAction(nameof(GetTeacherProfile), new { teacherId = result.TeacherId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Attempted to review a non-existent teacher");
            return NotFound(ex.Message);
        }
    }

    /// <summary>Seznam všech učitelů (id, jméno, fotka, průměr recenzí).</summary>
    [HttpGet("teachers")]
    [ProducesResponseType(typeof(List<TeacherListItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTeachers()
    {
        var teachers = await _ratingService.GetTeachersAsync();
        return Ok(teachers);
    }

    /// <summary>Doplňující údaje o učiteli (bio, abstence, bingovost, ocenění).</summary>
    [HttpGet("teacher/{teacherId:int}")]
    [ProducesResponseType(typeof(TeacherProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTeacherProfile(int teacherId)
    {
        try
        {
            var profile = await _ratingService.GetTeacherProfileAsync(teacherId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Attempted to view profile of a non-existent teacher");
            return NotFound(ex.Message);
        }
    }

    [HttpGet("teacher/{teacherId:int}/average")]
    [ProducesResponseType(typeof(float), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAverageRating(int teacherId)
    {
        var average = await _ratingService.GetAverageRatingAsync(teacherId);
        return Ok(average);
    }

    [HttpPut("{reviewId:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ReviewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] UpdateReviewRequest request)
    {
        try
        {
            var result = await _ratingService.UpdateReviewAsync(reviewId, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Attempted to update a non-existent review");
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{reviewId:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteReview(int reviewId)
    {
        try
        {
            await _ratingService.DeleteReviewAsync(reviewId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Attempted to delete a non-existent review");
            return NotFound(ex.Message);
        }
    }
}
