namespace TeacherControl.Api.Features.Reviews.Models;

public sealed record ReviewResponse(int Id, int TeacherId, string Content,
    DateTime CreatedAt, DateTime? UpdatedAt, bool IsMine);
