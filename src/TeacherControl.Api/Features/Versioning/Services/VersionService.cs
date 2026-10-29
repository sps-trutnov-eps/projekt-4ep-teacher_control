using System.Reflection;
using System.Text.Json;

using TeacherControl.Api.Features.Versioning.Models;

namespace TeacherControl.Api.Features.Versioning.Services;

public class VersionService
{
    private readonly VersionDto _versionDto;

    public VersionService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<VersionService> logger)
    {
        var metadata = Assembly.GetExecutingAssembly().GetCustomAttributes<AssemblyMetadataAttribute>()
            .ToDictionary(attribute => attribute.Key, attribute => attribute.Value);
        var shaVersion = FirstConfiguredValue(configuration, "SOURCE_COMMIT")
                         ?? metadata.GetValueOrDefault("SourceCommit")
                         ?? "Neznámo";
        var repoPath = FirstConfiguredValue(configuration, "GITHUB_REPOSITORY")
                       ?? metadata.GetValueOrDefault("GitHubRepository");

        _versionDto = SetVersionDto(shaVersion, repoPath, httpClientFactory, logger).Result;
    }

    private static string? FirstConfiguredValue(IConfiguration configuration, params string[] keys)
    {
        return keys.Select(key => configuration[key]?.Trim()).FirstOrDefault(value => !string.IsNullOrEmpty(value));
    }

    private async Task<VersionDto> SetVersionDto(string sha, string? path, IHttpClientFactory httpClientFactory,
        ILogger<VersionService> logger)
    {
        var fallback = new VersionDto { Sha = sha };

        if (string.IsNullOrEmpty(path) || sha == "Neznámo")
            return fallback;

        try
        {
            var response = await httpClientFactory
                .CreateClient("github")
                .GetAsync($"repos/{path}/commits/{sha}");

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("GitHub returned {Status} for commit {Sha}", response.StatusCode, sha);
                return fallback;
            }

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            var root = doc.RootElement;
            var commit = root.GetProperty("commit");
            var author = commit.GetProperty("author");

            var versionDto = new VersionDto
            {
                Sha = root.GetProperty("sha").GetString(),
                Message = commit.GetProperty("message").GetString(),
                Author = author.GetProperty("name").GetString(),
                Date = author.GetProperty("date").GetString(),
                Url = root.GetProperty("html_url").GetString()
            };

            return versionDto;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to load commit details for {Sha}", sha);
            return fallback;
        }
    }

    public VersionDto GetVersion() => _versionDto;
}
