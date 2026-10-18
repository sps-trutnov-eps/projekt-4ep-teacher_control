namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// Počet minut, o který se má navýšit dnešní pozdní příchod daného učitele.
/// </summary>
public record SubmitLateArrivalRequest(int Minutes);
