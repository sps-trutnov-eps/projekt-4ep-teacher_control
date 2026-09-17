namespace TeacherControl.Api.Entities;

public class BingoBoardEntity
{
    public int Id { get; set; }
    public required DateTime Date { get; set; } = DateTime.Today;
    public required string StudentId { get; set; }
    public required UserEntity Student { get; set; }
    
    public required ICollection<BingoBoardQuoteEntity> Quotes { get; set; } = new List<BingoBoardQuoteEntity>();
}