namespace TeacherControl.Api.Features.Rating.DTOs;

public class TeacherProfileResponse
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public string? PhotoUrl { get; set; }
    public required string Description { get; set; }
    public required float Mood { get; set; }
    public required float AverageRating { get; set; }
    public required int ReviewCount { get; set; }
}
