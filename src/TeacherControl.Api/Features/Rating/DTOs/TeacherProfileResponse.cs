using System.Text.Json.Serialization;

namespace TeacherControl.Api.Features.Rating.DTOs;

public class TeacherProfileResponse
{
    [JsonPropertyName("full_name")]
    public required string FullName { get; set; }

    [JsonPropertyName("image_url")]
    public string? ImageUrl { get; set; }

    [JsonPropertyName("bio")]
    public required string Bio { get; set; }

    /// <summary>Průměr hodnocení z recenzí (1-5), 0 pokud žádné nejsou.</summary>
    [JsonPropertyName("review")]
    public required float Review { get; set; }

    /// <summary>0-5, kde 5 = učitel s nejmenší absencí, 0 = učitel s největší absencí.</summary>
    [JsonPropertyName("abstention")]
    public required float Abstention { get; set; }

    /// <summary>0-5, relativně k učiteli s nejvíce odškrtnutými hláškami.</summary>
    [JsonPropertyName("binginess")]
    public required float Binginess { get; set; }

    /// <summary>Ocenění, které učitel získal (nejvíc hlasů v dané kategorii a pololetí).</summary>
    [JsonPropertyName("awards")]
    public required List<TeacherAwardResponse> Awards { get; set; }
}

public class TeacherAwardResponse
{
    [JsonPropertyName("award")]
    public required string Award { get; set; }

    [JsonPropertyName("year")]
    public required int Year { get; set; } // TitleVoteEntity.Pololeti
}
