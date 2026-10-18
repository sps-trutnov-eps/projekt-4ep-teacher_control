namespace TeacherControl.Api.Features.Pololeti.Models;

/// <summary>
/// Votes je počet hlasů, které učitel v aktuálním pololetí u titulu má.
/// MyVoteTeacherId je učitel, kterému přihlášený uživatel dal svůj hlas o tento titul –
/// null, pokud ještě nehlasoval nebo není přihlášený.
/// </summary>
public record TitleVotesDto(int TeacherTitleId, string Title, int Votes, int? MyVoteTeacherId);
