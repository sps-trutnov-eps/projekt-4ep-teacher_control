using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Rating.DTOs;

/// <summary>
/// Doplňující údaje o učiteli. Jméno, fotka a průměr recenzí jsou v seznamu (<see cref="TeacherListItemResponse"/>).
/// </summary>
public class TeacherProfileResponse
{
    public required string Bio { get; set; }

    /// <summary>0-5, kde 5 = učitel s nejmenší absencí, 0 = učitel s největší absencí (zaokrouhleno).</summary>
    public required int Abstention { get; set; }

    /// <summary>0-5, relativně k učiteli s nejvíce odškrtnutými hláškami (zaokrouhleno).</summary>
    public required int Binginess { get; set; }

    /// <summary>Ocenění, která učitel získal (nejvíc hlasů v dané kategorii a pololetí).</summary>
    public required List<TeacherAwardResponse> Awards { get; set; }
}

public class TeacherAwardResponse
{
    public required string Award { get; set; }

    /// <summary>Nezáporné číslo pololetí (TitleVoteEntity.Pololeti), 0 odpovídá roku 2026.</summary>
    [Range(0, int.MaxValue)]
    public required int Year { get; set; }
}
