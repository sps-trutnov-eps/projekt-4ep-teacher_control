using Microsoft.Extensions.Logging;

namespace TeacherControl.Api.Features.Login.Services;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendConfirmationCodeAsync(string recipientEmail, string code, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("==================================================");
        _logger.LogInformation("[EMAIL SERVICE MOCK - EMAIL CONFIRMATION]");
        _logger.LogInformation("To:        {RecipientEmail}", recipientEmail);
        _logger.LogInformation("Subject:   Ověření e-mailu - Teacher Control");
        _logger.LogInformation("Code:      {Code}", code);
        _logger.LogInformation("Validity:  15 minut");
        _logger.LogInformation("Timestamp: {Timestamp}", DateTime.UtcNow);
        _logger.LogInformation("==================================================");

        return Task.CompletedTask;
    }
}
