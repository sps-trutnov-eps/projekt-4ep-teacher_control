namespace TeacherControl.Api.Features.Reviews.Models;

public enum ReviewWriteOutcome
{
    Success,
    TeacherNotFound,
    ReviewNotFound,
    AlreadyExists,
    Forbidden
}
