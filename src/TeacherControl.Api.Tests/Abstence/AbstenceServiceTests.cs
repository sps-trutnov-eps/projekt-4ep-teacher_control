using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Abstence.Models;
using TeacherControl.Api.Features.Abstence.Services;

namespace TeacherControl.Api.Tests.Abstence;

[Collection(PostgresCollection.Name)]
public class AbstenceServiceTests(PostgresFixture db)
{
    private static readonly TimeSpan Cooldown = TimeSpan.FromMinutes(30);

    // Každé volání má vlastní kontext, stejně jako scoped požadavek v API.
    private async Task<AbstenceWriteResult> LateArrivalAsync(int teacherId, string studentId, int minutes)
    {
        await using var context = db.CreateContext();
        return await new AbstenceService(context).SubmitLateArrivalAsync(teacherId, studentId, minutes);
    }

    private async Task<AbstenceWriteResult> MoodAsync(int teacherId, string studentId, float value)
    {
        await using var context = db.CreateContext();
        return await new AbstenceService(context).SubmitMoodAsync(teacherId, studentId, value);
    }

    private async Task<List<LateArrivalEntity>> StoredArrivalsAsync(int teacherId)
    {
        await using var context = db.CreateContext();
        return await context.LateArrivals.Where(a => a.TeacherId == teacherId).ToListAsync();
    }

    private async Task<TeacherEntity> StoredTeacherAsync(int teacherId)
    {
        await using var context = db.CreateContext();
        return await context.Teachers.AsNoTracking().SingleAsync(t => t.Id == teacherId);
    }

    // ---------- pozdní příchod ----------

    [Fact]
    public async Task LateArrival_IsStoredAndReturnedInDto()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var result = await LateArrivalAsync(teacher.Id, student.Id, 12);

        Assert.Equal(AbstenceWriteOutcome.Success, result.Outcome);
        Assert.Equal(12, result.Teacher!.LateArrivalMinutesToday);
        var stored = Assert.Single(await StoredArrivalsAsync(teacher.Id));
        Assert.Equal(student.Id, stored.StudentId);
        Assert.Equal(TimeSpan.FromMinutes(12), stored.TimeSpan);
        Assert.NotNull((await StoredTeacherAsync(teacher.Id)).LastLateArrivalSubmissionAt);
    }

    [Fact]
    public async Task LateArrival_AnotherStudentWithinCooldown_IsRejectedAndNotStored()
    {
        var teacher = await db.SeedTeacherAsync();
        var studentA = await db.SeedStudentAsync();
        var studentB = await db.SeedStudentAsync();

        await LateArrivalAsync(teacher.Id, studentA.Id, 10);
        var second = await LateArrivalAsync(teacher.Id, studentB.Id, 20);

        Assert.Equal(AbstenceWriteOutcome.TooSoon, second.Outcome);
        Assert.NotNull(second.RetryAfter);
        Assert.InRange(second.RetryAfter!.Value, TimeSpan.FromMinutes(29), Cooldown);
        var stored = Assert.Single(await StoredArrivalsAsync(teacher.Id));
        Assert.Equal(studentA.Id, stored.StudentId);
    }

    [Fact]
    public async Task LateArrival_SameStudentWithinCooldown_IsRejected()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        await LateArrivalAsync(teacher.Id, student.Id, 10);
        var second = await LateArrivalAsync(teacher.Id, student.Id, 10);

        Assert.Equal(AbstenceWriteOutcome.TooSoon, second.Outcome);
        Assert.Single(await StoredArrivalsAsync(teacher.Id));
    }

    [Fact]
    public async Task LateArrival_DoesNotLockOtherTeachers()
    {
        var teacherA = await db.SeedTeacherAsync();
        var teacherB = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        await LateArrivalAsync(teacherA.Id, student.Id, 10);
        var other = await LateArrivalAsync(teacherB.Id, student.Id, 10);

        Assert.Equal(AbstenceWriteOutcome.Success, other.Outcome);
    }

    [Fact]
    public async Task LateArrival_AfterCooldownExpired_IsAcceptedAndMinutesAreSummed()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();
        await LateArrivalAsync(teacher.Id, student.Id, 10);

        await db.SetLastSubmissionsAsync(teacher.Id, DateTime.UtcNow - Cooldown - TimeSpan.FromMinutes(1), null);
        var second = await LateArrivalAsync(teacher.Id, student.Id, 15);

        Assert.Equal(AbstenceWriteOutcome.Success, second.Outcome);
        Assert.Equal(25, second.Teacher!.LateArrivalMinutesToday);
        Assert.Equal(2, (await StoredArrivalsAsync(teacher.Id)).Count);
    }

    [Fact]
    public async Task LateArrival_JustInsideCooldown_IsStillRejected()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        await db.SetLastSubmissionsAsync(teacher.Id, DateTime.UtcNow - Cooldown + TimeSpan.FromMinutes(1), null);
        var result = await LateArrivalAsync(teacher.Id, student.Id, 5);

        Assert.Equal(AbstenceWriteOutcome.TooSoon, result.Outcome);
        Assert.InRange(result.RetryAfter!.Value, TimeSpan.Zero, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task LateArrival_UnknownTeacher_ReturnsNotFound()
    {
        var student = await db.SeedStudentAsync();

        var result = await LateArrivalAsync(int.MaxValue, student.Id, 5);

        Assert.Equal(AbstenceWriteOutcome.TeacherNotFound, result.Outcome);
    }

    [Fact]
    public async Task LateArrival_UnknownStudent_ReturnsInternalErrorAndDoesNotConsumeCooldown()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var broken = await LateArrivalAsync(teacher.Id, "neexistujici-student", 5);
        var valid = await LateArrivalAsync(teacher.Id, student.Id, 5);

        Assert.Equal(AbstenceWriteOutcome.InternalError, broken.Outcome);
        Assert.Equal(AbstenceWriteOutcome.Success, valid.Outcome);
    }

    [Fact]
    public async Task LateArrival_ConcurrentSubmissions_OnlyOneIsStored()
    {
        var teacher = await db.SeedTeacherAsync();
        var students = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => db.SeedStudentAsync()));

        var results = await Task.WhenAll(students.Select(s => Task.Run(() => LateArrivalAsync(teacher.Id, s.Id, 10))));

        Assert.Equal(1, results.Count(r => r.Outcome == AbstenceWriteOutcome.Success));
        Assert.Equal(9, results.Count(r => r.Outcome == AbstenceWriteOutcome.TooSoon));
        var stored = Assert.Single(await StoredArrivalsAsync(teacher.Id));
        Assert.Equal(TimeSpan.FromMinutes(10), stored.TimeSpan);
    }

    // ---------- nálada ----------

    [Fact]
    public async Task Mood_IsStoredAndReturnedInDto()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var result = await MoodAsync(teacher.Id, student.Id, 4.5f);

        Assert.Equal(AbstenceWriteOutcome.Success, result.Outcome);
        Assert.Equal(4.5f, result.Teacher!.Mood);
        var stored = await StoredTeacherAsync(teacher.Id);
        Assert.Equal(4.5f, stored.Mood);
        Assert.NotNull(stored.LastMoodSubmissionAt);
    }

    [Fact]
    public async Task Mood_AnotherStudentWithinCooldown_IsRejectedAndKeepsOriginalValue()
    {
        var teacher = await db.SeedTeacherAsync();
        var studentA = await db.SeedStudentAsync();
        var studentB = await db.SeedStudentAsync();

        await MoodAsync(teacher.Id, studentA.Id, 5);
        var second = await MoodAsync(teacher.Id, studentB.Id, 1);

        Assert.Equal(AbstenceWriteOutcome.TooSoon, second.Outcome);
        Assert.InRange(second.RetryAfter!.Value, TimeSpan.FromMinutes(29), Cooldown);
        Assert.Equal(5f, (await StoredTeacherAsync(teacher.Id)).Mood);
    }

    [Fact]
    public async Task Mood_AfterCooldownExpired_IsAccepted()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();
        await MoodAsync(teacher.Id, student.Id, 5);

        await db.SetLastSubmissionsAsync(teacher.Id, null, DateTime.UtcNow - Cooldown - TimeSpan.FromMinutes(1));
        var second = await MoodAsync(teacher.Id, student.Id, 2);

        Assert.Equal(AbstenceWriteOutcome.Success, second.Outcome);
        Assert.Equal(2f, (await StoredTeacherAsync(teacher.Id)).Mood);
    }

    [Fact]
    public async Task Mood_OutOfRangeValue_IsRejectedByDatabaseConstraint()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        // Validace patří do controlleru; CK_Teachers_Mood je poslední pojistka v DB.
        await Assert.ThrowsAnyAsync<Exception>(() => MoodAsync(teacher.Id, student.Id, 9));

        var stored = await StoredTeacherAsync(teacher.Id);
        Assert.Equal(3f, stored.Mood);
        Assert.Null(stored.LastMoodSubmissionAt);
    }

    [Fact]
    public async Task Mood_ConcurrentSubmissions_OnlyOneWinsAndItsValueIsStored()
    {
        var teacher = await db.SeedTeacherAsync();
        var students = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => db.SeedStudentAsync()));

        var results = await Task.WhenAll(
            students.Select((s, i) => Task.Run(() => MoodAsync(teacher.Id, s.Id, i % 5 + 1))));

        var winner = Assert.Single(results, r => r.Outcome == AbstenceWriteOutcome.Success);
        Assert.Equal(9, results.Count(r => r.Outcome == AbstenceWriteOutcome.TooSoon));
        Assert.Equal(winner.Teacher!.Mood, (await StoredTeacherAsync(teacher.Id)).Mood);
    }

    // ---------- nezávislost typů zápisu ----------

    [Fact]
    public async Task LateArrivalAndMood_HaveIndependentCooldowns()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var late = await LateArrivalAsync(teacher.Id, student.Id, 10);
        var mood = await MoodAsync(teacher.Id, student.Id, 2);

        Assert.Equal(AbstenceWriteOutcome.Success, late.Outcome);
        Assert.Equal(AbstenceWriteOutcome.Success, mood.Outcome);
        Assert.Equal(AbstenceWriteOutcome.TooSoon, (await LateArrivalAsync(teacher.Id, student.Id, 1)).Outcome);
        Assert.Equal(AbstenceWriteOutcome.TooSoon, (await MoodAsync(teacher.Id, student.Id, 1)).Outcome);
    }

    // ---------- čtení ----------

    [Fact]
    public async Task GetTeacher_ReturnsMoodAndTodaysLateMinutes()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();
        await SeedArrivalAsync(teacher.Id, student.Id, DateOnly.FromDateTime(DateTime.Now), 20);
        await SeedArrivalAsync(teacher.Id, student.Id, DateOnly.FromDateTime(DateTime.Now), 10);
        await SeedArrivalAsync(teacher.Id, student.Id, DateOnly.FromDateTime(DateTime.Now.AddDays(-1)), 45);

        await using var context = db.CreateContext();
        var dto = await new AbstenceService(context).GetTeacherAsync(teacher.Id);

        Assert.NotNull(dto);
        Assert.Equal(teacher.Id, dto.TeacherId);
        Assert.Equal(3f, dto.Mood);
        Assert.Equal(30, dto.LateArrivalMinutesToday); // včerejší příchod se do dneška nepočítá
        Assert.Null(dto.Rating);
    }

    [Fact]
    public async Task GetTeacher_UnknownTeacher_ReturnsNull()
    {
        await using var context = db.CreateContext();

        Assert.Null(await new AbstenceService(context).GetTeacherAsync(int.MaxValue));
    }

    [Fact]
    public async Task GetTeachers_ContainsSeededTeacher()
    {
        var teacher = await db.SeedTeacherAsync();

        await using var context = db.CreateContext();
        var all = await new AbstenceService(context).GetTeachersAsync();

        Assert.Contains(all, t => t.TeacherId == teacher.Id);
    }

    [Fact]
    public async Task GetLateArrivals_ReturnsRecordsNewestFirst()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();
        var today = DateOnly.FromDateTime(DateTime.Now);
        await SeedArrivalAsync(teacher.Id, student.Id, today.AddDays(-2), 5);
        await SeedArrivalAsync(teacher.Id, student.Id, today, 15);
        await SeedArrivalAsync(teacher.Id, student.Id, today.AddDays(-1), 25);

        await using var context = db.CreateContext();
        var records = await new AbstenceService(context).GetLateArrivalsAsync(teacher.Id);

        Assert.NotNull(records);
        Assert.Equal(
            [new LateArrivalRecordDto(today, 15), new LateArrivalRecordDto(today.AddDays(-1), 25), new LateArrivalRecordDto(today.AddDays(-2), 5)],
            records);
    }

    [Fact]
    public async Task GetLateArrivals_TeacherWithoutRecords_ReturnsEmptyList()
    {
        var teacher = await db.SeedTeacherAsync();

        await using var context = db.CreateContext();
        var records = await new AbstenceService(context).GetLateArrivalsAsync(teacher.Id);

        Assert.NotNull(records);
        Assert.Empty(records);
    }

    [Fact]
    public async Task GetLateArrivals_UnknownTeacher_ReturnsNull()
    {
        await using var context = db.CreateContext();

        Assert.Null(await new AbstenceService(context).GetLateArrivalsAsync(int.MaxValue));
    }

    private async Task SeedArrivalAsync(int teacherId, string studentId, DateOnly date, int minutes)
    {
        await using var context = db.CreateContext();
        context.LateArrivals.Add(new LateArrivalEntity
        {
            Date = date,
            TeacherId = teacherId,
            Teacher = null!,
            StudentId = studentId,
            Student = null!,
            TimeSpan = TimeSpan.FromMinutes(minutes),
        });
        await context.SaveChangesAsync();
    }
}
