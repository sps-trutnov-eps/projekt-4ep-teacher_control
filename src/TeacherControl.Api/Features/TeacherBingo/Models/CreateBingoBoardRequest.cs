namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record CreateBingoBoardRequest(int Size = 3, IReadOnlyCollection<string>? TeacherIds = null);
