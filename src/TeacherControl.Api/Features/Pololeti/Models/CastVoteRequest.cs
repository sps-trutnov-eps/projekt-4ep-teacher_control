namespace TeacherControl.Api.Features.Pololeti.Models;

/// <summary>
/// Titul, o který dává přihlášený uživatel hlas učiteli z URL.
/// </summary>
public record CastVoteRequest(int TeacherTitleId);
