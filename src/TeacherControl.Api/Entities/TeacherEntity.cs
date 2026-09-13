namespace TeacherControl.Api.Entities;

public class TeacherEntity
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public string? PhotoUrl { get; set; }
    public string Description { get; set; } = "";
    public ICollection<AwardEntity> Awards { get; set; } = new List<AwardEntity>();
    public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
}