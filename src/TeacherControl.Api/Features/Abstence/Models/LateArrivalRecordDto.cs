namespace TeacherControl.Api.Features.Abstence.Models;

/// <summary>
/// Jeden záznam pozdního příchodu učitele (anonymizovaný – bez identity žáka).
/// </summary>
public record LateArrivalRecordDto(DateOnly Date, int Minutes);
