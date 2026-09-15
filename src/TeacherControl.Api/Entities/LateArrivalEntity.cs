using System.ComponentModel.DataAnnotations.Schema;

namespace TeacherControl.Api.Entities;

public class LateArrivalEntity
{
    public required int Id { get; set; }
    public required DateTime Date { get; set; }
    [ForeignKey(nameof(TeacherEntity))]
    public required int Teacher { get; set; }
    [ForeignKey(nameof(UserEntity))]
    public required int Student { get; set; }
    public required TimeSpan Time { get; set; }
}