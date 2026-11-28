using System.Net;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TeacherControl.Api.Tests.Abstence;

/// <summary>
/// Celá aplikace přes HTTP (skutečný Program, skutečná PostgreSQL): nepřihlášený uživatel nesmí
/// z Abstence dostat žádná data o učitelích ani zapisovat.
/// </summary>
[Collection(PostgresCollection.Name)]
public sealed class AbstenceAuthorizationTests : IDisposable
{
    private sealed class ApiFactory(string connectionString) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            // Program čte connection string hned při startu, proto proměnná prostředí.
            Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", connectionString);
        }
    }

    private readonly ApiFactory _factory;
    private readonly HttpClient _client;

    public AbstenceAuthorizationTests(PostgresFixture db)
    {
        _factory = new ApiFactory(db.ConnectionString);
        _client = _factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    [Theory]
    [InlineData("/api/abstence")]
    [InlineData("/api/abstence/1")]
    [InlineData("/api/abstence/1/late-arrivals")]
    public async Task Get_WithoutLogin_ReturnsUnauthorizedWithoutData(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(string.Empty, await response.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("/api/abstence/1/late-arrival", """{"minutes":5}""")]
    [InlineData("/api/abstence/1/mood", """{"value":3}""")]
    public async Task Post_WithoutLogin_ReturnsUnauthorized(string url, string json)
    {
        var response = await _client.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
