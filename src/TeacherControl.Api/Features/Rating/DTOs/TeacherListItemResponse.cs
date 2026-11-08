using System.Text.Json.Serialization;

namespace TeacherControl.Api.Features.Rating.DTOs;

/// <summary>Položka seznamu učitelů.</summary>
public class TeacherListItemResponse
{
    [JsonPropertyName("id")]
    public required int Id { get; set; }

    [JsonPropertyName("full_name")]
    public required string FullName { get; set; }

    /// <summary>Adresa fotky, nebo zástupný obrázek, pokud ji učitel nemá.</summary>
    [JsonPropertyName("image_url")]
    public required string ImageUrl { get; set; }

    /// <summary>Průměr recenzí zaokrouhlený na celé číslo (0 = bez recenzí).</summary>
    [JsonPropertyName("review")]
    public required int Review { get; set; }
}
