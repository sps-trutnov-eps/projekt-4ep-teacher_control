namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record CreateTeacherQuoteRequest(string TeacherId, string TeacherName, string Quote);
