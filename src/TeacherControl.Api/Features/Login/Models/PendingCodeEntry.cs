namespace TeacherControl.Api.Features.Login.Models;

public class PendingCodeEntry
{
    public required string Code { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAtUtc { get; set; } = DateTime.UtcNow.AddMinutes(15);
    public int AttemptCount { get; set; } = 0;
}
