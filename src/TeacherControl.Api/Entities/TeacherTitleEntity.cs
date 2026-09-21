using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Entities;

public class TeacherTitleEntity
{
    public int Id { get; set; }
    [MaxLength(80)]
    public required string Title { get; set; }
}