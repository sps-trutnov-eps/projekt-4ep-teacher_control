namespace TeacherControl.Api.Features.Pololeti.Models;

/// <summary>
/// Výsledek hlasování v PololetiService – controller si podle něj vybere HTTP odpověď.
/// </summary>
public enum VoteOutcome
{
    Success,
    TeacherNotFound,
    TitleNotFound,

    // Dva souběžné první hlasy stejného uživatele o stejný titul – druhý narazí na primární klíč.
    Conflict,

    // Přihlášený uživatel, pod kterým se hlasuje, by v DB měl vždy existovat —
    // pokud ne, jde o vnitřní nekonzistenci, ne o běžný "not found" stav.
    InternalError
}
