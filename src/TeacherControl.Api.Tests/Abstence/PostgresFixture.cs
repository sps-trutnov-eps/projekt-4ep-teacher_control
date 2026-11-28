using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;

namespace TeacherControl.Api.Tests.Abstence;

/// <summary>
/// Testy Abstence běží proti skutečné PostgreSQL (žádný InMemory provider), aby se ověřilo i chování
/// timestamptz, check constraintů, transakcí a souběhu. Pro celou sadu se vytvoří jedna dočasná
/// databáze, nad kterou se spustí skutečné migrace; po testech se smaže.
///
/// Připojení: proměnná prostředí TEST_POSTGRES_CONNECTION (účet musí smět zakládat databáze),
/// jinak výchozí lokální vývojová databáze z docker/db-only.docker-compose.yaml.
/// </summary>
public sealed class PostgresFixture : IAsyncLifetime
{
    public const string ConnectionEnvVar = "TEST_POSTGRES_CONNECTION";

    private const string DefaultConnection =
        "Host=localhost;Port=5432;Database=postgres;Username=control;Password=TeacherControl123!";

    private string _connectionString = "";

    /// <summary>Připojení na dočasnou testovací databázi (platné až po InitializeAsync).</summary>
    public string ConnectionString => _connectionString;

    public async Task InitializeAsync()
    {
        var baseConnection = Environment.GetEnvironmentVariable(ConnectionEnvVar) is { Length: > 0 } fromEnv
            ? fromEnv
            : DefaultConnection;

        _connectionString = new NpgsqlConnectionStringBuilder(baseConnection)
        {
            Database = $"teacher_control_tests_{Guid.NewGuid():N}",
            Timeout = 5,
        }.ConnectionString;

        try
        {
            await using var context = CreateContext();
            await context.Database.MigrateAsync();
        }
        catch (Exception ex) when (ex is NpgsqlException or InvalidOperationException)
        {
            throw new InvalidOperationException(
                "Testy Abstence potřebují běžící PostgreSQL. Spusť ji přes " +
                "`docker compose -f docker/db-only.docker-compose.yaml --env-file .env up -d` " +
                $"nebo nastav proměnnou {ConnectionEnvVar}. Příčina: {ex.Message}", ex);
        }
    }

    public async Task DisposeAsync()
    {
        if (_connectionString.Length == 0)
            return;

        NpgsqlConnection.ClearAllPools();
        await using var context = CreateContext();
        await context.Database.EnsureDeletedAsync();
    }

    /// <summary>Nový kontext — každý požadavek v produkci má vlastní scoped kontext.</summary>
    public AppDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(_connectionString).Options);

    public async Task<TeacherEntity> SeedTeacherAsync()
    {
        await using var context = CreateContext();
        var teacher = new TeacherEntity { Name = $"Učitel {Guid.NewGuid():N}", Mood = 3 };
        context.Teachers.Add(teacher);
        await context.SaveChangesAsync();
        return teacher;
    }

    public async Task<UserEntity> SeedStudentAsync()
    {
        await using var context = CreateContext();
        var name = $"student-{Guid.NewGuid():N}";
        var student = new UserEntity
        {
            UserName = name,
            NormalizedUserName = name.ToUpperInvariant(),
            Email = $"{name}@example.com",
            NormalizedEmail = $"{name}@example.com".ToUpperInvariant(),
        };
        context.Users.Add(student);
        await context.SaveChangesAsync();
        return student;
    }

    /// <summary>Posune poslední zápis do minulosti, aby se nemuselo čekat 30 minut.</summary>
    public async Task SetLastSubmissionsAsync(int teacherId, DateTime? lateArrivalAt, DateTime? moodAt)
    {
        await using var context = CreateContext();
        await context.Teachers
            .Where(t => t.Id == teacherId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.LastLateArrivalSubmissionAt, lateArrivalAt)
                .SetProperty(t => t.LastMoodSubmissionAt, moodAt));
    }
}

[CollectionDefinition(Name)]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture>
{
    public const string Name = "Postgres";
}
