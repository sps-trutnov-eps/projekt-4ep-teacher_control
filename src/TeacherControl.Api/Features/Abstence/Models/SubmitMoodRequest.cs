namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// Nová hodnota nálady učitele (1–5), kterou se přepíše ta stávající.
/// </summary>
public record SubmitMoodRequest(float Value);
