namespace TeacherControl.Api.Features.Reviews.Models;

public sealed record ReviewsTeacherProfileResponse(int Id, string Name, string? Nickname, string? PhotoUrl,
    string Description, float Mood, double? AverageRating, int ReviewCount, int Likes, int Dislikes,
    int? MyReaction, List<ReviewsReviewResponse> Reviews);
