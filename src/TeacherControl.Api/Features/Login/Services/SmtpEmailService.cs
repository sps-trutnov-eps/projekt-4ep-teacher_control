using System.Net;
using System.Net.Mail;

using Microsoft.Extensions.Options;

using TeacherControl.Api.Features.Login.Models;

namespace TeacherControl.Api.Features.Login.Services;

/// <summary>
/// Sends the confirmation code via SMTP using the configured credentials.
/// The code is always printed to the console as well. If SMTP is not configured, only the console output happens.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendConfirmationCodeAsync(string recipientEmail, string code, CancellationToken cancellationToken = default)
    {
        const string subject = "Ověření e-mailu - Teacher Control";

        _logger.LogInformation("==================================================");
        _logger.LogInformation("[EMAIL CONFIRMATION]");
        _logger.LogInformation("To:        {RecipientEmail}", recipientEmail);
        _logger.LogInformation("Subject:   {Subject}", subject);
        _logger.LogInformation("Code:      {Code}", code);
        _logger.LogInformation("Validity:  15 minut");
        _logger.LogInformation("Timestamp: {Timestamp}", DateTime.UtcNow);
        _logger.LogInformation("==================================================");

        if (!_options.IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured (Email:Host is empty); the code was only written to the log.");
            return;
        }

        var fromAddress = string.IsNullOrWhiteSpace(_options.From) ? _options.Username : _options.From;
        if (string.IsNullOrWhiteSpace(fromAddress))
        {
            _logger.LogError("Email:From or Email:Username must be set; the email was not sent.");
            return;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(fromAddress, _options.FromName),
                Subject = subject,
                Body = $"Váš potvrzovací kód je: {code}\n\nKód je platný 15 minut. Pokud jste o ověření nežádali, tento e-mail ignorujte.",
                IsBodyHtml = false
            };
            message.To.Add(recipientEmail);

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 15000
            };
            if (!string.IsNullOrWhiteSpace(_options.Username))
            {
                client.Credentials = new NetworkCredential(_options.Username, _options.Password);
            }

            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Confirmation email sent to {RecipientEmail}.", recipientEmail);
        }
        catch (Exception ex) when (ex is SmtpException or FormatException or OperationCanceledException or IOException)
        {
            // The code is already in the log and the user can request a resend, so don't fail registration.
            _logger.LogError(ex, "Failed to send confirmation email to {RecipientEmail}.", recipientEmail);
        }
    }
}
