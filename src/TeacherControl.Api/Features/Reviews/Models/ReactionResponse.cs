namespace TeacherControl.Api.Features.Reviews.Models;

public sealed record ReactionResponse(int Likes, int Dislikes, int? MyReaction);
