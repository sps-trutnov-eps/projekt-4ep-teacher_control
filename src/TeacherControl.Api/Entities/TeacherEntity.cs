using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Entities;

public class TeacherEntity
{
    [Key]
    public int Id { get; set; }
    [MaxLength(100)]
    public required string Name { get; set; }
    [MaxLength(100)]
    public string? PhotoUrl { get; set; }
    [MaxLength(25)]
    public string? LoginName { get; set; }
    public required string Description { get; set; } = "";
    // public ICollection<AwardEntity> Awards { get; set; } = new List<AwardEntity>(); <-- TBD
    public ICollection<ReviewEntity> Reviews { get; set; } = new List<ReviewEntity>();
    public ICollection<LateArrivalEntity> LateArrivals { get; set; } = new List<LateArrivalEntity>();

    /// <summary>
    ///     Prozatimní nápad je takový, že se bude ukládat číslo, které bude každý jedním nějakým submittem ovlivňovat
    ///     o třeba max 1 hvězdu. Jak ale v tu chvíli zajistit, že každý nebude moct furt a furt posílat POST?
        /// <remarks>
        /// Výchozí hodnota je střední, idk co používat jako výchozí, jestli nechat jako 5/5, nebo používat střed. — Matěj K
        /// </remarks>
    /// </summary>
    public required float Mood { get; set; } = 3; 
    
}