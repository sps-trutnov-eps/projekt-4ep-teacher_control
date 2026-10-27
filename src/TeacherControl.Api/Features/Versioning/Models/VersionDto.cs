namespace TeacherControl.Api.Features.Versioning.Models;

public class VersionDto
{
    public string? Sha { get; set; }
    public string? Message { get; set; }
    public string? Author { get; set; }
    public string? Date { get; set; }
    public string? Url { get; set; }
}