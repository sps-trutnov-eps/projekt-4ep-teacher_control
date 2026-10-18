namespace TeacherControl.Api.Entities;

public class BingoBoardQuoteMarkEntity
{
    public required string StudentId { get; set; }
    public required UserEntity Student { get; set; }

    public required int BingoBoardQuoteId { get; set; }
    public required BingoBoardQuoteEntity BingoBoardQuote { get; set; }
}