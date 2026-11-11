using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Reviews.Models;

public sealed class ReactionRequest : IValidatableObject
{
    public int Value { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Value is not (-1 or 1))
            yield return new ValidationResult("Hodnota musí být 1 (Like) nebo -1 (Dislike).", [nameof(Value)]);
    }
}
