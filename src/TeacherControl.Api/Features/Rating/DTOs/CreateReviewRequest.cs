using System.ComponentModel.DataAnnotations;

namespace TeacherControl.Api.Features.Rating.DTOs;

public class CreateReviewRequest
{
    public required int TeacherId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }

    // Stejné omezení hlídá i DB (CK_Reviews_Rating v AppDbContext), tady ho chytáme døív jako 400.
    [Range(1.0, 5.0, ErrorMessage = "Rating must be between 1 and 5.")]
    public required float Rating { get; set; }
}