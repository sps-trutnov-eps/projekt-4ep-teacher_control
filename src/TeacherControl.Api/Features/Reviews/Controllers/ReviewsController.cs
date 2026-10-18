using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Reviews.Models;

namespace TeacherControl.Api.Features.Reviews.Controllers;

[ApiController]
[Authorize]
[Route("api/reviews")]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;


    [HttpGet("teachers")]
    public async Task<ActionResult<List<TeacherResponse>>> GetTeachers(
        [FromQuery, StringLength(100)] string? search, CancellationToken cancellationToken)
    {
        var query = db.Teachers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term)
                || (t.LoginName != null && t.LoginName.ToLower().Contains(term)));
        }
        return Ok(await ProjectTeachers(query).OrderBy(t => t.Name).ToListAsync(cancellationToken));
    }

    [HttpGet("teachers/{teacherId:int}")]
    public async Task<ActionResult<TeacherProfileResponse>> GetTeacher(int teacherId, CancellationToken cancellationToken)
    {
        var teacher = await db.Teachers.AsNoTracking().Where(t => t.Id == teacherId)
            .Select(t => new
            {
                t.Id, t.Name, t.LoginName, t.PhotoUrl, t.Description, t.Mood,
                AverageRating = db.Reviews.Where(r => r.TeacherId == t.Id)
                    .Select(r => (double?)r.Rating).Average(),
                ReviewCount = db.TextReviews.Count(r => r.TeacherId == t.Id),
                Likes = db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == 1),
                Dislikes = db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == -1),
                MyReaction = db.TeacherReactions.Where(r => r.TeacherId == t.Id && r.UserId == UserId)
                    .Select(r => (int?)r.Value).SingleOrDefault()
            }).SingleOrDefaultAsync(cancellationToken);
        if (teacher is null) return NotFound();

        var reviews = await db.TextReviews.AsNoTracking().Where(r => r.TeacherId == teacherId)
            .OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)
            .Select(r => new ReviewResponse(r.Id, r.TeacherId, r.Content, r.CreatedAt, r.UpdatedAt, r.AuthorId == UserId))
            .ToListAsync(cancellationToken);
        return Ok(new TeacherProfileResponse(teacher.Id, teacher.Name, teacher.LoginName, teacher.PhotoUrl,
            teacher.Description, teacher.Mood, teacher.AverageRating, teacher.ReviewCount, teacher.Likes,
            teacher.Dislikes, teacher.MyReaction, reviews));
    }

    private IQueryable<TeacherResponse> ProjectTeachers(IQueryable<TeacherEntity> query)
    {
        var userId = UserId;
        return query.Select(t => new TeacherResponse(t.Id, t.Name, t.PhotoUrl, t.Description,
            db.Reviews.Where(r => r.TeacherId == t.Id).Select(r => (double?)r.Rating).Average(),
            db.TextReviews.Count(r => r.TeacherId == t.Id),
            db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == 1),
            db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == -1),
            db.TeacherReactions.Where(r => r.TeacherId == t.Id && r.UserId == userId)
                .Select(r => (int?)r.Value).SingleOrDefault()));
    }

    [HttpGet("teachers/{teacherId:int}/reviews")]
    public async Task<ActionResult<List<ReviewResponse>>> GetReviews(int teacherId, CancellationToken cancellationToken)
    {
        if (!await db.Teachers.AnyAsync(t => t.Id == teacherId, cancellationToken)) return NotFound();
        var userId = UserId;
        return Ok(await db.TextReviews.AsNoTracking().Where(r => r.TeacherId == teacherId)
            .OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)
            .Select(r => new ReviewResponse(r.Id, r.TeacherId, r.Content, r.CreatedAt, r.UpdatedAt, r.AuthorId == userId))
            .ToListAsync(cancellationToken));
    }

    [HttpPost("teachers/{teacherId:int}/reviews")]
    public async Task<ActionResult<ReviewResponse>> CreateReview(int teacherId, ReviewRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Recenze nesmí být prázdná.");
        if (!await db.Teachers.AnyAsync(t => t.Id == teacherId, cancellationToken)) return NotFound();
        if (await db.TextReviews.AnyAsync(r => r.TeacherId == teacherId && r.AuthorId == UserId, cancellationToken))
            return Conflict("Tomuto učiteli už jste recenzi napsali.");
        var review = new TextReviewEntity
        {
            TeacherId = teacherId, AuthorId = UserId, Content = request.Content.Trim(), CreatedAt = DateTime.UtcNow
        };
        db.TextReviews.Add(review);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        { return Conflict("Tomuto učiteli už jste recenzi napsali."); }
        return CreatedAtAction(nameof(GetReviews), new { teacherId }, ToResponse(review));
    }

    [HttpPut("{reviewId:int}")]
    public async Task<ActionResult<ReviewResponse>> UpdateReview(int reviewId, ReviewRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Recenze nesmí být prázdná.");
        var review = await db.TextReviews.FindAsync([reviewId], cancellationToken);
        if (review is null) return NotFound();
        if (review.AuthorId != UserId) return Forbid();
        review.Content = request.Content.Trim();
        review.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(review));
    }

    [HttpDelete("{reviewId:int}")]
    public async Task<IActionResult> DeleteReview(int reviewId, CancellationToken cancellationToken)
    {
        var review = await db.TextReviews.FindAsync([reviewId], cancellationToken);
        if (review is null) return NotFound();
        if (review.AuthorId != UserId) return Forbid();
        db.TextReviews.Remove(review);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut("teachers/{teacherId:int}/reaction")]
    public async Task<ActionResult<ReactionResponse>> SetReaction(int teacherId, ReactionRequest request, CancellationToken cancellationToken)
    {
        if (!await db.Teachers.AnyAsync(t => t.Id == teacherId, cancellationToken)) return NotFound();
        var userId = UserId;
        if (request.Value == 0)
            await db.TeacherReactions.Where(r => r.TeacherId == teacherId && r.UserId == userId)
                .ExecuteDeleteAsync(cancellationToken);
        else
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO "TeacherReactions" ("TeacherId", "UserId", "Value")
                VALUES ({teacherId}, {userId}, {request.Value})
                ON CONFLICT ("TeacherId", "UserId") DO UPDATE SET "Value" = EXCLUDED."Value"
                """, cancellationToken);
        return Ok(await db.Teachers.Where(t => t.Id == teacherId).Select(t => new ReactionResponse(
            db.TeacherReactions.Count(r => r.TeacherId == teacherId && r.Value == 1),
            db.TeacherReactions.Count(r => r.TeacherId == teacherId && r.Value == -1),
            db.TeacherReactions.Where(r => r.TeacherId == teacherId && r.UserId == userId)
                .Select(r => (int?)r.Value).SingleOrDefault())).SingleAsync(cancellationToken));
    }

    private static ReviewResponse ToResponse(TextReviewEntity review) =>
        new(review.Id, review.TeacherId, review.Content, review.CreatedAt, review.UpdatedAt, true);
}
