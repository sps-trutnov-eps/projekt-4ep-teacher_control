namespace TeacherControl.Api.Features.Rating.DTOs;

public class UpdateReviewRequest
{
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required float Rating { get; set; } // 1-5, overuje i DB check constraint
}
