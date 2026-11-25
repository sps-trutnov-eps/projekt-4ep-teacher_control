namespace TeacherControl.Api.Features.Login.Models;

/// <summary>
/// SMTP settings bound from the "Email" configuration section.
/// Environment variables: Email__Host, Email__Port, Email__Username, Email__Password, Email__From, Email__EnableSsl.
/// When Host is empty, no email is sent and the code is only printed to the console.
/// </summary>
public class EmailOptions
{
    public const string SectionName = "Email";

    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public string? Username { get; set; }
    public string? Password { get; set; }
    /// <summary>Sender address; defaults to Username.</summary>
    public string? From { get; set; }
    public string FromName { get; set; } = "Teacher Control";
    public bool EnableSsl { get; set; } = true;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Host);
}
