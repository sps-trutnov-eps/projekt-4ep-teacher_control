namespace TeacherControl.Api.Entities;

public class BingoBoardEntity
{
    public int Id { get; set; }
    public DateOnly Date { get; set; } = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Europe/Prague"));

    public ICollection<BingoBoardQuoteEntity> Quotes { get; set; } = new List<BingoBoardQuoteEntity>();
}