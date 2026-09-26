namespace TeacherControl.Api.Features.Rating.DTOs;

public class ReviewResponse
{
    public required int Id { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required float Rating { get; set; }
    public required int TeacherId { get; set; }
    public required string StudentId { get; set; }
}
