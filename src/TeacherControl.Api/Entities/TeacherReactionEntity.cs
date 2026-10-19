namespace TeacherControl.Api.Entities;

public class TeacherReactionEntity
{
    public int TeacherId { get; set; }
    public TeacherEntity Teacher { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public UserEntity User { get; set; } = null!;
    public int Value { get; set; }
}
