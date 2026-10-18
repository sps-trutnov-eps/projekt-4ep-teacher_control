using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Reviews.Models;

namespace TeacherControl.Api.Features.Reviews.Services;

public enum ReviewWriteOutcome
{
    Success,
    TeacherNotFound,
    ReviewNotFound,
    AlreadyExists,
    Forbidden
}

public sealed record ReviewWriteResult(ReviewWriteOutcome Outcome, ReviewResponse? Review = null);

public sealed class ReviewsService
{
    private readonly AppDbContext _db;

    public ReviewsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TeacherResponse>> GetTeachersAsync(
        string userId, string? search, CancellationToken cancellationToken)
    {
        var query = _db.Teachers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term)
                || (t.LoginName != null && t.LoginName.ToLower().Contains(term)));
        }

        return await ProjectTeachers(query, userId).OrderBy(t => t.Name).ToListAsync(cancellationToken);
    }

    public async Task<TeacherProfileResponse?> GetTeacherAsync(
        int teacherId, string userId, CancellationToken cancellationToken)
    {
        var teacher = await _db.Teachers.AsNoTracking().Where(t => t.Id == teacherId)
            .Select(t => new
            {
                t.Id, t.Name, t.LoginName, t.PhotoUrl, t.Description, t.Mood,
                AverageRating = _db.Reviews.Where(r => r.TeacherId == t.Id)
                    .Select(r => (double?)r.Rating).Average(),
                ReviewCount = _db.TextReviews.Count(r => r.TeacherId == t.Id),
                Likes = _db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == 1),
                Dislikes = _db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == -1),
                MyReaction = _db.TeacherReactions.Where(r => r.TeacherId == t.Id && r.UserId == userId)
                    .Select(r => (int?)r.Value).SingleOrDefault()
            }).SingleOrDefaultAsync(cancellationToken);
        if (teacher is null) return null;

        var reviews = await GetTeacherReviewsAsync(teacherId, userId, cancellationToken);
        return new TeacherProfileResponse(teacher.Id, teacher.Name, teacher.LoginName, teacher.PhotoUrl,
            teacher.Description, teacher.Mood, teacher.AverageRating, teacher.ReviewCount, teacher.Likes,
            teacher.Dislikes, teacher.MyReaction, reviews);
    }

    public async Task<List<ReviewResponse>?> GetReviewsAsync(
        int teacherId, string userId, CancellationToken cancellationToken)
    {
        if (!await _db.Teachers.AnyAsync(t => t.Id == teacherId, cancellationToken)) return null;
        return await GetTeacherReviewsAsync(teacherId, userId, cancellationToken);
    }

    public async Task<ReviewWriteResult> CreateReviewAsync(
        int teacherId, string userId, string content, CancellationToken cancellationToken)
    {
        if (!await _db.Teachers.AnyAsync(t => t.Id == teacherId, cancellationToken))
            return new ReviewWriteResult(ReviewWriteOutcome.TeacherNotFound);
        if (await _db.TextReviews.AnyAsync(r => r.TeacherId == teacherId && r.AuthorId == userId, cancellationToken))
            return new ReviewWriteResult(ReviewWriteOutcome.AlreadyExists);

        var review = new TextReviewEntity
        {
            TeacherId = teacherId,
            AuthorId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        _db.TextReviews.Add(review);
        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            return new ReviewWriteResult(ReviewWriteOutcome.AlreadyExists);
        }

        return new ReviewWriteResult(ReviewWriteOutcome.Success, ToResponse(review, userId));
    }

    public async Task<ReviewWriteResult> UpdateReviewAsync(
        int reviewId, string userId, string content, CancellationToken cancellationToken)
    {
        var review = await _db.TextReviews.FindAsync([reviewId], cancellationToken);
        if (review is null) return new ReviewWriteResult(ReviewWriteOutcome.ReviewNotFound);
        if (review.AuthorId != userId) return new ReviewWriteResult(ReviewWriteOutcome.Forbidden);

        review.Content = content.Trim();
        review.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return new ReviewWriteResult(ReviewWriteOutcome.Success, ToResponse(review, userId));
    }

    public async Task<ReviewWriteOutcome> DeleteReviewAsync(
        int reviewId, string userId, CancellationToken cancellationToken)
    {
        var review = await _db.TextReviews.FindAsync([reviewId], cancellationToken);
        if (review is null) return ReviewWriteOutcome.ReviewNotFound;
        if (review.AuthorId != userId) return ReviewWriteOutcome.Forbidden;

        _db.TextReviews.Remove(review);
        await _db.SaveChangesAsync(cancellationToken);
        return ReviewWriteOutcome.Success;
    }

    public async Task<ReactionResponse?> SetReactionAsync(
        int teacherId, string userId, int value, CancellationToken cancellationToken)
    {
        if (!await _db.Teachers.AnyAsync(t => t.Id == teacherId, cancellationToken)) return null;

        var reaction = await _db.TeacherReactions
            .SingleOrDefaultAsync(r => r.TeacherId == teacherId && r.UserId == userId, cancellationToken);
        if (reaction is null)
        {
            _db.TeacherReactions.Add(new TeacherReactionEntity
            {
                TeacherId = teacherId,
                UserId = userId,
                Value = value
            });
        }
        else
        {
            reaction.Value = value;
        }

        await _db.SaveChangesAsync(cancellationToken);

        return await _db.Teachers.Where(t => t.Id == teacherId).Select(t => new ReactionResponse(
            _db.TeacherReactions.Count(r => r.TeacherId == teacherId && r.Value == 1),
            _db.TeacherReactions.Count(r => r.TeacherId == teacherId && r.Value == -1),
            _db.TeacherReactions.Where(r => r.TeacherId == teacherId && r.UserId == userId)
                .Select(r => (int?)r.Value).SingleOrDefault())).SingleAsync(cancellationToken);
    }

    private IQueryable<TeacherResponse> ProjectTeachers(IQueryable<TeacherEntity> query, string userId) =>
        query.Select(t => new TeacherResponse(t.Id, t.Name, t.PhotoUrl, t.Description,
            _db.Reviews.Where(r => r.TeacherId == t.Id).Select(r => (double?)r.Rating).Average(),
            _db.TextReviews.Count(r => r.TeacherId == t.Id),
            _db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == 1),
            _db.TeacherReactions.Count(r => r.TeacherId == t.Id && r.Value == -1),
            _db.TeacherReactions.Where(r => r.TeacherId == t.Id && r.UserId == userId)
                .Select(r => (int?)r.Value).SingleOrDefault()));

    private Task<List<ReviewResponse>> GetTeacherReviewsAsync(
        int teacherId, string userId, CancellationToken cancellationToken) =>
        _db.TextReviews.AsNoTracking().Where(r => r.TeacherId == teacherId)
            .OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)
            .Select(r => new ReviewResponse(r.Id, r.TeacherId, r.Content, r.CreatedAt, r.UpdatedAt, r.AuthorId == userId))
            .ToListAsync(cancellationToken);

    private static ReviewResponse ToResponse(TextReviewEntity review, string userId) =>
        new(review.Id, review.TeacherId, review.Content, review.CreatedAt, review.UpdatedAt, review.AuthorId == userId);
}
