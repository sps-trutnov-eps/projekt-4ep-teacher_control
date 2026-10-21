using System.ComponentModel.DataAnnotations.Schema;

namespace TeacherControl.Api.Entities;

public class HistoricTitleEntity
{
    public int Id { get; set; }

    public int TeacherTitleId { get; set; }
    public required TeacherTitleEntity TeacherTitle { get; set; }

    public int WinningTeacherId { get; set; }
    public required TeacherEntity WinningTeacher { get; set; }

    public int Pololeti { get; set; }

    [NotMapped]
    public const int StartYear = 2026;
    public string GetPololetiText()
    {
        var yearOffset = Pololeti / 2;
        var isFirstHalf = Pololeti % 2 == 0;

        var startYear = StartYear + yearOffset;

        return isFirstHalf ? $"{startYear}/{startYear + 1} – 1. pololetí" : $"{startYear}/{startYear + 1} – 2. pololetí";
    }
}