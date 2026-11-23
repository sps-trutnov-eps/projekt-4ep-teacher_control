using System.Net;
using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TeacherControl.Api.Features.Login.Models;
using TeacherControl.Api.Features.Login.Services;
using Xunit;

namespace TeacherControl.Api.Tests;

public class SmtpEmailServiceTests
{
    private class ListLogger : ILogger<SmtpEmailService>
    {
        public List<string> Messages { get; } = new();
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => Messages.Add(formatter(state, exception));
    }

    // Minimal plain-text SMTP server that captures one message.
    private static (int Port, Task<string> Data) StartFakeSmtp()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        var task = Task.Run(async () =>
        {
            using var client = await listener.AcceptTcpClientAsync();
            listener.Stop();
            using var stream = client.GetStream();
            using var reader = new StreamReader(stream, Encoding.UTF8);
            using var writer = new StreamWriter(stream, new UTF8Encoding(false)) { NewLine = "\r\n", AutoFlush = true };
            await writer.WriteLineAsync("220 fake ESMTP");
            var body = new StringBuilder();
            var inData = false;
            string? line;
            while ((line = await reader.ReadLineAsync()) is not null)
            {
                if (inData)
                {
                    if (line == ".") { inData = false; await writer.WriteLineAsync("250 OK"); continue; }
                    body.AppendLine(line);
                    continue;
                }
                var cmd = line.ToUpperInvariant();
                if (cmd.StartsWith("EHLO") || cmd.StartsWith("HELO")) await writer.WriteLineAsync("250 fake");
                else if (cmd.StartsWith("DATA")) { inData = true; await writer.WriteLineAsync("354 go"); }
                else if (cmd.StartsWith("QUIT")) { await writer.WriteLineAsync("221 bye"); break; }
                else await writer.WriteLineAsync("250 OK");
            }
            return body.ToString();
        });
        return (port, task);
    }

    [Fact]
    public async Task SendsEmailViaSmtpAndLogsCode()
    {
        var (port, data) = StartFakeSmtp();
        var logger = new ListLogger();
        var service = new SmtpEmailService(Options.Create(new EmailOptions
        {
            Host = "127.0.0.1", Port = port, EnableSsl = false, From = "noreply@spstrutnov.cz"
        }), logger);

        await service.SendConfirmationCodeAsync("student@spstrutnov.cz", "123456");

        var received = await data.WaitAsync(TimeSpan.FromSeconds(10));
        var bodyPart = received.Replace("\r\n", "\n").Split("\n\n", 2)[1];
        var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(
            bodyPart.Replace("\r", "").Replace("\n", "").Trim()));
        Assert.Contains("123456", decoded);
        Assert.Contains(logger.Messages, m => m.Contains("123456"));
    }

    [Fact]
    public async Task OnlyLogsCodeWhenNotConfigured()
    {
        var logger = new ListLogger();
        var service = new SmtpEmailService(Options.Create(new EmailOptions()), logger);

        await service.SendConfirmationCodeAsync("student@spstrutnov.cz", "654321");

        Assert.Contains(logger.Messages, m => m.Contains("654321"));
    }

    [Fact]
    public async Task SmtpFailureDoesNotThrowAndCodeIsStillLogged()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop(); // nothing listens -> connection refused
        var logger = new ListLogger();
        var service = new SmtpEmailService(Options.Create(new EmailOptions
        {
            Host = "127.0.0.1", Port = port, EnableSsl = false, From = "noreply@spstrutnov.cz"
        }), logger);

        await service.SendConfirmationCodeAsync("student@spstrutnov.cz", "111222");

        Assert.Contains(logger.Messages, m => m.Contains("111222"));
        Assert.Contains(logger.Messages, m => m.Contains("Failed to send"));
    }
}
