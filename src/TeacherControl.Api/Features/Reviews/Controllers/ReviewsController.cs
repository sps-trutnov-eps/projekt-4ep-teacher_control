using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TeacherControl.Api.Features.Reviews.Models;
using TeacherControl.Api.Features.Reviews.Services;

namespace TeacherControl.Api.Features.Reviews.Controllers;

[ApiController]
[Authorize]
[Route("api/reviews")]
public class ReviewsController(Reviews reviews) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (string.IsNullOrWhiteSpace(User.FindFirstValue(ClaimTypes.NameIdentifier)))
            context.Result = Unauthorized();
        base.OnActionExecuting(context);
    }

    [HttpGet("teachers")]
    public async Task<ActionResult<List<TeacherResponse>>> GetTeachers(
        [FromQuery, StringLength(100)] string? search, CancellationToken cancellationToken) =>
        Ok(await reviews.GetTeachersAsync(UserId, search, cancellationToken));

    [HttpGet("teachers/{teacherId:int}")]
    public async Task<ActionResult<TeacherProfileResponse>> GetTeacher(
        int teacherId, CancellationToken cancellationToken)
    {
        var teacher = await reviews.GetTeacherAsync(teacherId, UserId, cancellationToken);
        return teacher is null ? NotFound() : Ok(teacher);
    }

    [HttpGet("teachers/{teacherId:int}/reviews")]
    public async Task<ActionResult<List<ReviewResponse>>> GetReviews(
        int teacherId, CancellationToken cancellationToken)
    {
        var result = await reviews.GetReviewsAsync(teacherId, UserId, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("teachers/{teacherId:int}/reviews")]
    public async Task<ActionResult<ReviewResponse>> CreateReview(
        int teacherId, ReviewRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Recenze nesmí být prázdná.");

        var result = await reviews.CreateReviewAsync(teacherId, UserId, request.Content, cancellationToken);
        return result.Outcome switch
        {
            ReviewWriteOutcome.TeacherNotFound => NotFound(),
            ReviewWriteOutcome.AlreadyExists => Conflict("Tomuto učiteli už jste recenzi napsali."),
            _ => CreatedAtAction(nameof(GetReviews), new { teacherId }, result.Review)
        };
    }

    [HttpPut("{reviewId:int}")]
    public async Task<ActionResult<ReviewResponse>> UpdateReview(
        int reviewId, ReviewRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Recenze nesmí být prázdná.");

        var result = await reviews.UpdateReviewAsync(reviewId, UserId, request.Content, cancellationToken);
        return result.Outcome switch
        {
            ReviewWriteOutcome.ReviewNotFound => NotFound(),
            ReviewWriteOutcome.Forbidden => Forbid(),
            _ => Ok(result.Review)
        };
    }

    [HttpDelete("{reviewId:int}")]
    public async Task<IActionResult> DeleteReview(int reviewId, CancellationToken cancellationToken)
    {
        var outcome = await reviews.DeleteReviewAsync(reviewId, UserId, cancellationToken);
        return outcome switch
        {
            ReviewWriteOutcome.ReviewNotFound => NotFound(),
            ReviewWriteOutcome.Forbidden => Forbid(),
            _ => NoContent()
        };
    }

    [HttpPut("teachers/{teacherId:int}/reaction")]
    public async Task<ActionResult<ReactionResponse>> SetReaction(
        int teacherId, ReactionRequest request, CancellationToken cancellationToken)
    {
        var reaction = await reviews.SetReactionAsync(teacherId, UserId, request.Value, cancellationToken);
        return reaction is null ? NotFound() : Ok(reaction);
    }
}
