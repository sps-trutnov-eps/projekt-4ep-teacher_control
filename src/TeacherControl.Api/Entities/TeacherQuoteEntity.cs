namespace TeacherControl.Api.Entities;

public class TeacherQuoteEntity
{
    public int Id { get; set; }
    
    public required int TeacherId { get; set; }
    public required TeacherEntity Teacher { get; set; }
    
    public required string Quote { get; set; }
}