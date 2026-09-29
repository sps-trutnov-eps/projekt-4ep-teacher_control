namespace TeacherControl.Api.Entities;

public class BingoBoardEntity
{
    public int Id { get; set; }
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Europe/Prague"));
    public required string StudentId { get; set; }
    public required UserEntity Student { get; set; }
    
    public ICollection<BingoBoardQuoteEntity> Quotes { get; set; } = new List<BingoBoardQuoteEntity>();
}