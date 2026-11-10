namespace TeacherControl.Api.Features.TeacherBingo.Models;

public sealed record BingoCellDto(string Id, int Row, int Col, TeacherQuoteDto Quote, bool IsMarked);
