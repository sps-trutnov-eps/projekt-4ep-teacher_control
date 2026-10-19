using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Reviews.Models;

public sealed class ReviewRequest
{
    [Required, StringLength(5000, MinimumLength = 1)]
    public string Content { get; set; } = "";
}
