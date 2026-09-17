namespace TeacherControl.Api.Entities;

public class BingoBoardEntity
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.Today;
    public string StudentId { get; set; }
    public UserEntity Student { get; set; }
    
    public ICollection<BingoBoardQuoteEntity> Quotes { get; set; } = new List<BingoBoardQuoteEntity>();
}