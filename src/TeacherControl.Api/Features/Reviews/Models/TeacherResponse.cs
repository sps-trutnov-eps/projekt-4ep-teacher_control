namespace TeacherControl.Api.Features.Reviews.Models;

public sealed record TeacherResponse(int Id, string Name, string? PhotoUrl, string Description,
    double? AverageRating, int ReviewCount, int Likes, int Dislikes, int? MyReaction);
