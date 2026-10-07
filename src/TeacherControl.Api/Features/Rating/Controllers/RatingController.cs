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

    [HttpGet("teacher/{teacherId:int}/profile")]
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

    [HttpPut("{reviewId:int}")]
    [Authorize(Roles = "Admin")]
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