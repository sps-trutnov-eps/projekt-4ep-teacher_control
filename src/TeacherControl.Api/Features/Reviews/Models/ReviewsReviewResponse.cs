namespace TeacherControl.Api.Features.Reviews.Models;

public sealed record ReviewsReviewResponse(int Id, int TeacherId, string Content,
    DateTime CreatedAt, DateTime? UpdatedAt, bool IsMine);
