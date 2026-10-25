using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Login.DTOs;
using TeacherControl.Api.Features.Login.Services;
using Xunit;

namespace TeacherControl.Api.Tests;

public class LoginServiceTests
{
    private class TestEmailService : IEmailService
    {
        public List<(string Email, string Code)> SentCodes { get; } = new();

        public Task SendConfirmationCodeAsync(string recipientEmail, string code, CancellationToken cancellationToken = default)
        {
            SentCodes.Add((recipientEmail, code));
            return Task.CompletedTask;
        }
    }

    private static (LoginService service, AppDbContext db, TestEmailService emailService, IMemoryCache cache) CreateService()
    {
        var dbName = Guid.NewGuid().ToString();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        var db = new AppDbContext(options);

        var userStore = new Microsoft.AspNetCore.Identity.EntityFrameworkCore.UserStore<UserEntity>(db);
        var identityOptions = Options.Create(new IdentityOptions
        {
            User = { RequireUniqueEmail = true },
            Password =
            {
                RequiredLength = 8,
                RequireDigit = true,
                RequireLowercase = true,
                RequireUppercase = true,
                RequireNonAlphanumeric = true
            },
            SignIn = { RequireConfirmedEmail = true }
        });

        var passwordHasher = new PasswordHasher<UserEntity>();
        var userValidators = new List<IUserValidator<UserEntity>> { new UserValidator<UserEntity>() };
        var passwordValidators = new List<IPasswordValidator<UserEntity>> { new PasswordValidator<UserEntity>() };

        var userManager = new UserManager<UserEntity>(
            userStore,
            identityOptions,
            passwordHasher,
            userValidators,
            passwordValidators,
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            null!,
            NullLogger<UserManager<UserEntity>>.Instance);

        var roleStore = new Microsoft.AspNetCore.Identity.EntityFrameworkCore.RoleStore<IdentityRole>(db);
        var roleManager = new RoleManager<IdentityRole>(
            roleStore,
            new List<IRoleValidator<IdentityRole>> { new RoleValidator<IdentityRole>() },
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            NullLogger<RoleManager<IdentityRole>>.Instance);

        var contextAccessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext()
        };
        var claimsFactory = new UserClaimsPrincipalFactory<UserEntity, IdentityRole>(userManager, roleManager, identityOptions);

        var authServiceMock = new TestAuthService();
        var services = new Microsoft.Extensions.DependencyInjection.ServiceCollection();
        services.AddSingleton<IAuthenticationService>(authServiceMock);
        contextAccessor.HttpContext.RequestServices = services.BuildServiceProvider();

        var signInManager = new SignInManager<UserEntity>(
            userManager,
            contextAccessor,
            claimsFactory,
            identityOptions,
            NullLogger<SignInManager<UserEntity>>.Instance,
            new AuthenticationSchemeProvider(Options.Create(new AuthenticationOptions())),
            new DefaultUserConfirmation<UserEntity>());

        var cache = new MemoryCache(new MemoryCacheOptions());
        var emailService = new TestEmailService();
        var loginService = new LoginService(
            userManager,
            signInManager,
            roleManager,
            cache,
            emailService,
            NullLogger<LoginService>.Instance);

        return (loginService, db, emailService, cache);
    }

    private class TestAuthService : IAuthenticationService
    {
        public Task<AuthenticateResult> AuthenticateAsync(HttpContext context, string? scheme) =>
            Task.FromResult(AuthenticateResult.NoResult());

        public Task ChallengeAsync(HttpContext context, string? scheme, AuthenticationProperties? properties) =>
            Task.CompletedTask;

        public Task ForbidAsync(HttpContext context, string? scheme, AuthenticationProperties? properties) =>
            Task.CompletedTask;

        public Task SignInAsync(HttpContext context, string? scheme, ClaimsPrincipal principal, AuthenticationProperties? properties) =>
            Task.CompletedTask;

        public Task SignOutAsync(HttpContext context, string? scheme, AuthenticationProperties? properties) =>
            Task.CompletedTask;
    }

    [Fact]
    public async Task RegisterAsync_RejectsNonSchoolDomain()
    {
        var (service, _, _, _) = CreateService();

        var request = new RegisterRequest
        {
            Email = "jan.novak@gmail.com",
            Password = "Password123!"
        };

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.RegisterAsync(request));
        Assert.Contains("@spstrutnov.cz", ex.Message);
    }

    [Fact]
    public async Task RegisterAsync_ValidSchoolEmail_CreatesUnconfirmedUserAndSendsCode()
    {
        var (service, db, emailService, _) = CreateService();

        var request = new RegisterRequest
        {
            Email = "jan.novak@spstrutnov.cz",
            Password = "SecurePass123!"
        };

        var response = await service.RegisterAsync(request);

        Assert.Equal("jan.novak@spstrutnov.cz", response.Email);
        Assert.Single(emailService.SentCodes);
        var sent = emailService.SentCodes[0];
        Assert.Equal("jan.novak@spstrutnov.cz", sent.Email);
        Assert.Equal(6, sent.Code.Length);
        Assert.True(int.TryParse(sent.Code, out _));

        var userInDb = await db.Users.FirstOrDefaultAsync(u => u.Email == "jan.novak@spstrutnov.cz");
        Assert.NotNull(userInDb);
        Assert.False(userInDb.EmailConfirmed);
        Assert.Equal("jan.novak@spstrutnov.cz", userInDb.UserName);
    }

    [Fact]
    public async Task RegisterAsync_ExistingConfirmedUser_ThrowsInvalidOperationException()
    {
        var (service, db, _, _) = CreateService();

        db.Users.Add(new UserEntity
        {
            UserName = "jan.novak@spstrutnov.cz",
            NormalizedUserName = "JAN.NOVAK@SPSTRUTNOV.CZ",
            Email = "jan.novak@spstrutnov.cz",
            NormalizedEmail = "JAN.NOVAK@SPSTRUTNOV.CZ",
            EmailConfirmed = true
        });
        await db.SaveChangesAsync();

        var request = new RegisterRequest
        {
            Email = "jan.novak@spstrutnov.cz",
            Password = "SecurePass123!"
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(request));
        Assert.Contains("Účet s tímto e-mailem již existuje", ex.Message);
    }

    [Fact]
    public async Task ConfirmCodeAsync_CorrectCode_ConfirmsUserAndAssignsStudentRole()
    {
        var (service, db, emailService, _) = CreateService();

        var regRequest = new RegisterRequest
        {
            Email = "petr.svoboda@spstrutnov.cz",
            Password = "SecurePass123!"
        };
        await service.RegisterAsync(regRequest);
        var sentCode = emailService.SentCodes[0].Code;

        var confirmRequest = new ConfirmCodeRequest
        {
            Email = "petr.svoboda@spstrutnov.cz",
            Code = sentCode
        };

        var response = await service.ConfirmCodeAsync(confirmRequest);

        Assert.NotNull(response.User);
        Assert.Contains("student", response.User.Roles);

        var userInDb = await db.Users.FirstOrDefaultAsync(u => u.Email == "petr.svoboda@spstrutnov.cz");
        Assert.NotNull(userInDb);
        Assert.True(userInDb.EmailConfirmed);
    }

    [Fact]
    public async Task ConfirmCodeAsync_WrongCode_ThrowsArgumentException()
    {
        var (service, _, _, _) = CreateService();

        var regRequest = new RegisterRequest
        {
            Email = "petr.svoboda@spstrutnov.cz",
            Password = "SecurePass123!"
        };
        await service.RegisterAsync(regRequest);

        var confirmRequest = new ConfirmCodeRequest
        {
            Email = "petr.svoboda@spstrutnov.cz",
            Code = "000000" // wrong
        };

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.ConfirmCodeAsync(confirmRequest));
        Assert.Contains("nesprávný", ex.Message);
    }

    [Fact]
    public async Task ResendCodeAsync_BeforeCooldownExpires_ThrowsInvalidOperationException()
    {
        var (service, _, _, _) = CreateService();

        var regRequest = new RegisterRequest
        {
            Email = "anna.vesela@spstrutnov.cz",
            Password = "SecurePass123!"
        };
        await service.RegisterAsync(regRequest);

        var resendRequest = new ResendCodeRequest
        {
            Email = "anna.vesela@spstrutnov.cz"
        };

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.ResendCodeAsync(resendRequest));
        Assert.Contains("30 s", ex.Message);
    }

    [Fact]
    public async Task LoginAsync_UnconfirmedUser_ThrowsUnauthorizedAccessException()
    {
        var (service, _, _, _) = CreateService();

        var regRequest = new RegisterRequest
        {
            Email = "tomas.marny@spstrutnov.cz",
            Password = "SecurePass123!"
        };
        await service.RegisterAsync(regRequest);

        var loginRequest = new LoginRequest
        {
            Email = "tomas.marny@spstrutnov.cz",
            Password = "SecurePass123!"
        };

        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.LoginAsync(loginRequest));
        Assert.Contains("nebyl ověřen", ex.Message);
    }

    [Fact]
    public async Task ConfirmCode_MaxAttemptsExceeded_InvalidatesCode()
    {
        var (service, _, _, _) = CreateService();

        await service.RegisterAsync(new RegisterRequest
        {
            Email = "max.pokusu@spstrutnov.cz",
            Password = "SecurePass123!"
        });

        // 5 wrong attempts
        for (int i = 0; i < 5; i++)
        {
            await Assert.ThrowsAsync<ArgumentException>(() => service.ConfirmCodeAsync(new ConfirmCodeRequest
            {
                Email = "max.pokusu@spstrutnov.cz",
                Code = "999999"
            }));
        }

        // 6th attempt should throw InvalidOperationException due to max attempts exceeded
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.ConfirmCodeAsync(new ConfirmCodeRequest
        {
            Email = "max.pokusu@spstrutnov.cz",
            Code = "999999"
        }));
        Assert.Contains("maximální počet", ex.Message);
    }

    [Fact]
    public async Task LoginAsync_ConfirmedUser_Succeeds()
    {
        var (service, _, emailService, _) = CreateService();

        await service.RegisterAsync(new RegisterRequest
        {
            Email = "uspech.login@spstrutnov.cz",
            Password = "SecurePass123!"
        });

        var code = emailService.SentCodes[0].Code;
        await service.ConfirmCodeAsync(new ConfirmCodeRequest
        {
            Email = "uspech.login@spstrutnov.cz",
            Code = code
        });

        var loginResponse = await service.LoginAsync(new LoginRequest
        {
            Email = "uspech.login@spstrutnov.cz",
            Password = "SecurePass123!"
        });

        Assert.NotNull(loginResponse.User);
        Assert.Equal("uspech.login@spstrutnov.cz", loginResponse.User.DisplayName);
        Assert.Contains("student", loginResponse.User.Roles);
    }
}
