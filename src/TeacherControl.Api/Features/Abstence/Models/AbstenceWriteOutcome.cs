namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// Výsledek zápisu (pozdní příchod / nálada) v AbstenceService – controller si podle něj vybere HTTP odpověď.
/// </summary>
public enum AbstenceWriteOutcome
{
    Success,
    TeacherNotFound,
    TooSoon,

    // Přihlášený uživatel, pod kterým se zapisuje, by v DB měl vždy existovat —
    // pokud ne, jde o vnitřní nekonzistenci, ne o běžný "not found" stav.
    InternalError
}
