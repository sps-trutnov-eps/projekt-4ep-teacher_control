namespace TeacherControl.Api.Features.Reviews.Models;

public sealed record ReviewWriteResult(ReviewWriteOutcome Outcome, ReviewsReviewResponse? Review = null);
