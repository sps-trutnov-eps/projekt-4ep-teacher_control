namespace TeacherControl.Api.Entities;

public class TitleVoteEntity
{
    public required string StudentId { get; set; }
    public required UserEntity Student { get; set; }

    public required int TeacherTitleId { get; set; }
    public required TeacherTitleEntity TeacherTitle { get; set; }

    public required int TeacherId { get; set; }
    public required TeacherEntity Teacher { get; set; }

    // Same semester numbering as HistoricTitleEntity: 0 = first semester of 2026/2027.
    public required int Pololeti { get; set; }

    public DateTime VotedOn { get; set; } = DateTime.UtcNow;
}