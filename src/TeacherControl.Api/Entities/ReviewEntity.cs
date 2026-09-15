namespace TeacherControl.Api.Entities;

public class ReviewEntity
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    
    public required float Rating { get; set; }
    
    public required int TeacherId { get; set; }
    public required TeacherEntity Teacher { get; set; }
    
    public required string StudentId { get; set; }
    public required UserEntity Student { get; set; }
}