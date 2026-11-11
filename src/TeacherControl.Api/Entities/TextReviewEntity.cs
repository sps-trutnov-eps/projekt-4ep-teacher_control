namespace TeacherControl.Api.Entities;

public class TextReviewEntity
{
    public int Id { get; set; }
    public int TeacherId { get; set; }
    public TeacherEntity Teacher { get; set; } = null!;
    public string AuthorId { get; set; } = null!;
    public UserEntity Author { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
