namespace TeacherControl.Api.Features.Pololeti.Models;

/// <summary>
/// Teacher je vyplněný jen u výsledku Success – karta učitele už se započítaným hlasem.
/// </summary>
public record VoteResult(VoteOutcome Outcome, TeacherCardDto? Teacher = null);
