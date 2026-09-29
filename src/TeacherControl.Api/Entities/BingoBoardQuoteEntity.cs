namespace TeacherControl.Api.Entities;

public class BingoBoardQuoteEntity
{
    public int Id { get; set; }
    public required int BingoBoardId { get; set; }
    public required BingoBoardEntity BingoBoard { get; set; }
    
    public required int Position { get; set; }

    public required int QuoteId { get; set; }
    public required TeacherQuoteEntity Quote { get; set; }

    public ICollection<BingoBoardQuoteMarkEntity> Marks { get; set; } = new List<BingoBoardQuoteMarkEntity>();
}