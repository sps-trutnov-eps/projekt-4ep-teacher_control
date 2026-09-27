using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Entities;

public class TeacherQuoteEntity
{
    [Key]
    public int Id { get; set; }
    public required string Quote { get; set; }
    
    public required int TeacherId { get; set; }
    public required TeacherEntity Teacher { get; set; }
    
    public bool IsActive { get; set; } = true;
}