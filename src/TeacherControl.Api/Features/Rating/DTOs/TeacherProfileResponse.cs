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

    /// <summary>Prùmìr hodnocení z recenzí (1-5), 0 pokud žádné nejsou.</summary>
    [JsonPropertyName("review")]
    public required float Review { get; set; }

    /// <summary>0-5, kde 5 = uèitel s nejmenší absencí, 0 = uèitel s nejvìtší absencí.</summary>
    [JsonPropertyName("abstention")]
    public required float Abstention { get; set; }

    /// <summary>0-5, relativnì k uèiteli s nejvíce odškrtnutými hláškami.</summary>
    [JsonPropertyName("binginess")]
    public required float Binginess { get; set; }

    /// <summary>Ocenìní, která uèitel získal (nejvíc hlasù v dané kategorii a pololetí).</summary>
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