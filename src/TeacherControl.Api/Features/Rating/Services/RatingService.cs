using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Rating.DTOs;

namespace TeacherControl.Api.Features.Rating.Services;

public class RatingService
{
    private readonly AppDbContext _db;

    public RatingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewResponse> CreateReviewAsync(string studentId, CreateReviewRequest request)
    {
        var teacherExists = await _db.Teachers.AnyAsync(t => t.Id == request.TeacherId);
        if (!teacherExists)
            throw new KeyNotFoundException($"Teacher with id {request.TeacherId} was not found.");

        var review = new ReviewEntity
        {
            Title = request.Title,
            Content = request.Content,
            Rating = request.Rating,
            TeacherId = request.TeacherId,
            Teacher = null!, // EF si dotáhne přes FK, nastavovat navigation ručně není potřeba
            StudentId = studentId,
            Student = null!
        };

        _db.Reviews.Add(review); // TODO: over si skutecny nazev DbSetu v AppDbContext.cs
        await _db.SaveChangesAsync();

        return MapToResponse(review);
    }

    public async Task<List<ReviewResponse>> GetReviewsForTeacherAsync(int teacherId)
    {
        return await _db.Reviews
            .Where(r => r.TeacherId == teacherId)
            .Select(r => new ReviewResponse
            {
                Id = r.Id,
                Title = r.Title,
                Content = r.Content,
                Rating = r.Rating,
                TeacherId = r.TeacherId,
                StudentId = r.StudentId
            })
            .ToListAsync();
    }

    public async Task<float> GetAverageRatingAsync(int teacherId)
    {
        var ratings = await _db.Reviews
            .Where(r => r.TeacherId == teacherId)
            .Select(r => r.Rating)
            .ToListAsync();

        return ratings.Count == 0 ? 0f : ratings.Average();
    }

    private static ReviewResponse MapToResponse(ReviewEntity review) => new()
    {
        Id = review.Id,
        Title = review.Title,
        Content = review.Content,
        Rating = review.Rating,
        TeacherId = review.TeacherId,
        StudentId = review.StudentId
    };
}
