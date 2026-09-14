using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Entities;

public class TeacherEntity
{
    public required int Id { get; set; }
    [MaxLength(100)]
    public required string Name { get; set; }
    [MaxLength(100)]
    public string? PhotoUrl { get; set; }
    [MaxLength(25)]
    public string? LoginName { get; set; }
    public string Description { get; set; } = "";
    public ICollection<AwardEntity> Awards { get; set; } = new List<AwardEntity>();
    public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
    public ICollection<LateArrivalEntity> LateArrivals { get; set; } = new List<LateArrivalEntity>();
}