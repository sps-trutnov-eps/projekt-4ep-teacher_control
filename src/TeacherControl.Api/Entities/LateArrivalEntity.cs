using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Entities;

public class LateArrivalEntity
{
    [Key]
    public int Id { get; set; }
    public required DateTime Date { get; set; }
    
    public required int TeacherId { get; set; }
    public required TeacherEntity Teacher { get; set; }
    
    public required string StudentId { get; set; }
    public required UserEntity Student { get; set; }
    
    public required TimeSpan TimeSpan { get; set; }
}