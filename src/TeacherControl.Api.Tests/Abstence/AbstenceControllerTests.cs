using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Abstence.Controllers;
using TeacherControl.Api.Features.Abstence.Models;
using TeacherControl.Api.Features.Abstence.Services;

namespace TeacherControl.Api.Tests.Abstence;

/// <summary>
/// Controller nad skutečnou službou a skutečnou databází — ověřuje validaci vstupu a mapování
/// výsledků na HTTP odpovědi (400/401/404/429 + Retry-After).
/// </summary>
[Collection(PostgresCollection.Name)]
public class AbstenceControllerTests(PostgresFixture db)
{
    private AbstenceController CreateController(string? userId)
    {
        var context = db.CreateContext();
        var userManager = new UserManager<UserEntity>(
            new UserStore<UserEntity>(context),
            Options.Create(new IdentityOptions()),
            new PasswordHasher<UserEntity>(),
            [],
            [],
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            null!,
            NullLogger<UserManager<UserEntity>>.Instance);

        var identity = userId is null
            ? new ClaimsIdentity()
            : new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, userId)], "test");

        return new AbstenceController(NullLogger<AbstenceController>.Instance, new AbstenceService(context), userManager)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) },
            },
        };
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(481)]
    public async Task SubmitLateArrival_InvalidMinutes_ReturnsBadRequest(int minutes)
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var result = await CreateController(student.Id).SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(minutes));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(0f)]
    [InlineData(0.9f)]
    [InlineData(5.1f)]
    [InlineData(6f)]
    public async Task SubmitMood_InvalidValue_ReturnsBadRequest(float value)
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var result = await CreateController(student.Id).SubmitMood(teacher.Id, new SubmitMoodRequest(value));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task SubmitLateArrival_WithoutUserIdentity_ReturnsUnauthorized()
    {
        var teacher = await db.SeedTeacherAsync();

        var result = await CreateController(null).SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(5));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task SubmitMood_WithoutUserIdentity_ReturnsUnauthorized()
    {
        var teacher = await db.SeedTeacherAsync();

        var result = await CreateController(null).SubmitMood(teacher.Id, new SubmitMoodRequest(3));

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task SubmitLateArrival_Valid_ReturnsOkWithUpdatedTeacher()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();

        var result = await CreateController(student.Id).SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(15));

        var dto = Assert.IsType<TeacherAbstenceDto>(Assert.IsType<OkObjectResult>(result.Result).Value);
        Assert.Equal(15, dto.LateArrivalMinutesToday);
    }

    [Fact]
    public async Task SubmitLateArrival_SecondSubmissionByAnotherStudent_Returns429WithRetryAfter()
    {
        var teacher = await db.SeedTeacherAsync();
        var studentA = await db.SeedStudentAsync();
        var studentB = await db.SeedStudentAsync();
        await CreateController(studentA.Id).SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(10));

        var controller = CreateController(studentB.Id);
        var result = await controller.SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(10));

        var response = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status429TooManyRequests, response.StatusCode);
        Assert.Equal(AbstenceController.CooldownMessage, response.Value);
        var retryAfter = int.Parse(controller.Response.Headers.RetryAfter.ToString());
        Assert.InRange(retryAfter, 29 * 60, 30 * 60);
    }

    [Fact]
    public async Task SubmitMood_SecondSubmissionWithinCooldown_Returns429WithRetryAfter()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();
        await CreateController(student.Id).SubmitMood(teacher.Id, new SubmitMoodRequest(4));

        var controller = CreateController(student.Id);
        var result = await controller.SubmitMood(teacher.Id, new SubmitMoodRequest(2));

        Assert.Equal(StatusCodes.Status429TooManyRequests, Assert.IsType<ObjectResult>(result.Result).StatusCode);
        Assert.False(string.IsNullOrEmpty(controller.Response.Headers.RetryAfter));
    }

    [Fact]
    public async Task SubmitLateArrival_UnknownTeacher_ReturnsNotFound()
    {
        var student = await db.SeedStudentAsync();

        var result = await CreateController(student.Id).SubmitLateArrival(int.MaxValue, new SubmitLateArrivalRequest(5));

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task SubmitLateArrival_UserMissingInDatabase_Returns500()
    {
        var teacher = await db.SeedTeacherAsync();

        var result = await CreateController("neexistujici-student").SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(5));

        Assert.Equal(StatusCodes.Status500InternalServerError, Assert.IsType<StatusCodeResult>(result.Result).StatusCode);
    }

    [Fact]
    public async Task GetTeacher_Unknown_ReturnsNotFound()
    {
        var result = await CreateController(null).GetTeacher(int.MaxValue);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetLateArrivals_ReturnsRecordsAndNotFoundForUnknownTeacher()
    {
        var teacher = await db.SeedTeacherAsync();
        var student = await db.SeedStudentAsync();
        var controller = CreateController(student.Id);
        await controller.SubmitLateArrival(teacher.Id, new SubmitLateArrivalRequest(7));

        var ok = await controller.GetLateArrivals(teacher.Id);
        var notFound = await controller.GetLateArrivals(int.MaxValue);

        var records = Assert.IsType<List<LateArrivalRecordDto>>(Assert.IsType<OkObjectResult>(ok.Result).Value);
        Assert.Equal(7, Assert.Single(records).Minutes);
        Assert.IsType<NotFoundResult>(notFound.Result);
    }
}
