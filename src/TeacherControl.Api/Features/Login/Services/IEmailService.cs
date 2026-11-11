namespace TeacherControl.Api.Features.Login.Services;

public interface IEmailService
{
    Task SendConfirmationCodeAsync(string recipientEmail, string code, CancellationToken cancellationToken = default);
}
