namespace TeacherControl.Api.Entities;

public class BingoBoardQuoteEntity
{
    public int Id { get; set; }
    public required int BingoBoardId { get; set; }
    public required BingoBoardEntity BingoBoard { get; set; }
    
    public required int QuoteId { get; set; }
    public required TeacherQuoteEntity Quote { get; set; }
    
    // jestli ji už marknul že to učitel řekl, kdyžtak si to přejmenujte - MK
    public required bool Marked { get; set; } = false;
}