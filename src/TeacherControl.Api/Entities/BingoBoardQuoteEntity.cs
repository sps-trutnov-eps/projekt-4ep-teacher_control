namespace TeacherControl.Api.Entities;

public class BingoBoardQuoteEntity
{
    public int Id { get; set; }
    public int BingoBoardId { get; set; }
    public BingoBoardEntity BingoBoard { get; set; }
    
    public int QuoteId { get; set; }
    public TeacherQuoteEntity Quote { get; set; }
    
    // jestli ji už marknul že to učitel řekl, kdyžtak si to přejmenujte - MK
    public bool Marked { get; set; }
}