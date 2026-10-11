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

        _db.Reviews.Add(review);
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

    public async Task<TeacherProfileResponse> GetTeacherProfileAsync(int teacherId)
    {
        var teacher = await _db.Teachers.FindAsync(teacherId);
        if (teacher is null)
            throw new KeyNotFoundException($"Teacher with id {teacherId} was not found.");

        var review = await GetAverageRatingAsync(teacherId);
        var abstention = await CalculateAbstentionAsync(teacherId);
        var binginess = await CalculateBinginessAsync(teacherId);
        var awards = await GetAwardsAsync(teacherId);

        return new TeacherProfileResponse
        {
            FullName = teacher.Name,
            ImageUrl = teacher.PhotoUrl,
            Bio = teacher.Description,
            Review = review,
            Abstention = abstention,
            Binginess = binginess,
            Awards = awards
        };
    }

    /// <summary>
    /// ((součet pozdních příchodů učitele / největší součet mezi všemi učiteli) - 1) * -5
    /// = 5 pro učitele bez absence, 0 pro učitele s největší absencí.
    /// </summary>
    private async Task<float> CalculateAbstentionAsync(int teacherId)
    {
        // Sumu intervalů počítáme v paměti (přes Ticks), aby nezáleželo na tom,
        // jak umí provider přeložit Sum() nad TimeSpan.
        var arrivals = await _db.LateArrivals
            .Select(a => new { a.TeacherId, a.TimeSpan })
            .ToListAsync();

        var totals = arrivals
            .GroupBy(a => a.TeacherId)
            .ToDictionary(g => g.Key, g => g.Sum(a => a.TimeSpan.Ticks));

        var max = totals.Count == 0 ? 0L : totals.Values.Max();
        if (max == 0)
            return 5f; // nikdo nemá absenci -> dělení nulou nehrozí

        var mine = totals.GetValueOrDefault(teacherId);
        return (float)(((double)mine / max - 1) * -5);
    }

    /// <summary>
    /// (odškrtnuté hlášky učitele / nejvíc odškrtnutých hlášek u jednoho učitele) * 5
    /// </summary>
    private async Task<float> CalculateBinginessAsync(int teacherId)
    {
        var counts = await _db.BingoBoardQuotes
            .Where(q => q.Marked)
            .GroupBy(q => q.Quote.TeacherId)
            .Select(g => new { TeacherId = g.Key, Count = g.Count() })
            .ToListAsync();

        var max = counts.Count == 0 ? 0 : counts.Max(c => c.Count);
        if (max == 0)
            return 0f;

        var mine = counts.FirstOrDefault(c => c.TeacherId == teacherId)?.Count ?? 0;
        return (float)mine / max * 5f;
    }

    /// <summary>
    /// Ocenění = kategorie + pololetí, ve kterých má učitel nejvíc hlasů (při shodě ho dostanou všichni).
    /// </summary>
    private async Task<List<TeacherAwardResponse>> GetAwardsAsync(int teacherId)
    {
        var votes = await _db.TitleVotes
            .GroupBy(v => new { v.TeacherTitleId, v.Pololeti, v.TeacherId })
            .Select(g => new { g.Key.TeacherTitleId, g.Key.Pololeti, g.Key.TeacherId, Votes = g.Count() })
            .ToListAsync();

        var won = votes
            .GroupBy(v => new { v.TeacherTitleId, v.Pololeti })
            .Where(g => g.Any(v => v.TeacherId == teacherId && v.Votes == g.Max(x => x.Votes)))
            .Select(g => g.Key)
            .ToList();

        if (won.Count == 0)
            return new List<TeacherAwardResponse>();

        var titleIds = won.Select(w => w.TeacherTitleId).Distinct().ToList();
        var titles = await _db.TeacherTitles
            .Where(t => titleIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => t.Title);

        return won
            .OrderByDescending(w => w.Pololeti)
            .Select(w => new TeacherAwardResponse
            {
                Award = titles[w.TeacherTitleId],
                Year = w.Pololeti
            })
            .ToList();
    }

    public async Task<ReviewResponse> UpdateReviewAsync(int reviewId, UpdateReviewRequest request)
    {
        var review = await _db.Reviews.FindAsync(reviewId);
        if (review is null)
            throw new KeyNotFoundException($"Review with id {reviewId} was not found.");

        review.Title = request.Title;
        review.Content = request.Content;
        review.Rating = request.Rating;

        await _db.SaveChangesAsync();

        return MapToResponse(review);
    }

    public async Task DeleteReviewAsync(int reviewId)
    {
        var review = await _db.Reviews.FindAsync(reviewId);
        if (review is null)
            throw new KeyNotFoundException($"Review with id {reviewId} was not found.");

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
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