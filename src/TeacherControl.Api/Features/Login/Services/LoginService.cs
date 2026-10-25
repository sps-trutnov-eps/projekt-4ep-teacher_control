using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

using TeacherControl.Api.Entities;
using TeacherControl.Api.Features.Login.DTOs;
using TeacherControl.Api.Features.Login.Models;

namespace TeacherControl.Api.Features.Login.Services;

public class LoginService
{
    private const string SchoolEmailDomain = "@spstrutnov.cz";
    private readonly UserManager<UserEntity> _userManager;
    private readonly SignInManager<UserEntity> _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IMemoryCache _memoryCache;
    private readonly IEmailService _emailService;
    private readonly ILogger<LoginService> _logger;

    public LoginService(
        UserManager<UserEntity> userManager,
        SignInManager<UserEntity> signInManager,
        RoleManager<IdentityRole> roleManager,
        IMemoryCache memoryCache,
        IEmailService emailService,
        ILogger<LoginService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _memoryCache = memoryCache;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        ValidateSchoolEmail(normalizedEmail);

        var existingUser = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existingUser is not null)
        {
            if (existingUser.EmailConfirmed)
            {
                throw new InvalidOperationException("Účet s tímto e-mailem již existuje.");
            }

            var removePasswordResult = await _userManager.RemovePasswordAsync(existingUser);
            if (!removePasswordResult.Succeeded)
            {
                _logger.LogWarning("Failed to remove previous password for unconfirmed user {Email}", normalizedEmail);
            }

            var addPasswordResult = await _userManager.AddPasswordAsync(existingUser, request.Password);
            if (!addPasswordResult.Succeeded)
            {
                var errors = string.Join("; ", addPasswordResult.Errors.Select(e => e.Description));
                throw new ArgumentException(errors);
            }
        }
        else
        {
            var newUser = new UserEntity
            {
                UserName = normalizedEmail,
                Email = normalizedEmail,
                EmailConfirmed = false,
                FinishedBingoCount = 0
            };

            var createResult = await _userManager.CreateAsync(newUser, request.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new ArgumentException(errors);
            }
        }

        var code = GenerateConfirmationCode();
        var cacheKey = GetCacheKey(normalizedEmail);
        var entry = new PendingCodeEntry
        {
            Code = code,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(15),
            AttemptCount = 0
        };

        _memoryCache.Set(cacheKey, entry, TimeSpan.FromMinutes(15));

        await _emailService.SendConfirmationCodeAsync(normalizedEmail, code, cancellationToken);

        return new RegisterResponse
        {
            Message = "Potvrzovací kód byl odeslán na váš školní e-mail.",
            Email = normalizedEmail
        };
    }

    public async Task<ConfirmCodeResponse> ConfirmCodeAsync(ConfirmCodeRequest request)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var cacheKey = GetCacheKey(normalizedEmail);

        if (!_memoryCache.TryGetValue<PendingCodeEntry>(cacheKey, out var entry) || entry is null)
        {
            throw new KeyNotFoundException("Pro tento e-mail nebyla nalezena žádná čekající registrace nebo kód vypršel.");
        }

        if (DateTime.UtcNow > entry.ExpiresAtUtc)
        {
            _memoryCache.Remove(cacheKey);
            throw new InvalidOperationException("Potvrzovací kód vypršel. Nechte si prosím poslat nový kód.");
        }

        if (entry.AttemptCount >= 5)
        {
            _memoryCache.Remove(cacheKey);
            throw new InvalidOperationException("Byl překročen maximální počet neúspěšných pokusů. Nechte si poslat nový kód.");
        }

        if (entry.Code != request.Code.Trim())
        {
            entry.AttemptCount++;
            throw new ArgumentException("Zadaný potvrzovací kód je nesprávný. Zkontrolujte e-mail nebo si nechte poslat nový.");
        }

        var user = await _userManager.FindByEmailAsync(normalizedEmail)
            ?? throw new KeyNotFoundException("Uživatel s tímto e-mailem nebyl nalezen.");

        user.EmailConfirmed = true;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Nepodařilo se potvrdit účet: {errors}");
        }

        if (!await _roleManager.RoleExistsAsync("student"))
        {
            await _roleManager.CreateAsync(new IdentityRole("student"));
        }

        if (!await _userManager.IsInRoleAsync(user, "student"))
        {
            await _userManager.AddToRoleAsync(user, "student");
        }

        _memoryCache.Remove(cacheKey);

        await _signInManager.SignInAsync(user, isPersistent: false);

        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        if (roles.Count == 0)
        {
            roles.Add("student");
        }

        return new ConfirmCodeResponse
        {
            Message = "E-mail byl úspěšně ověřen a váš účet byl aktivován.",
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.FullName ?? user.UserName ?? user.Email ?? "student",
                Roles = roles
            }
        };
    }

    public async Task<ResendCodeResponse> ResendCodeAsync(ResendCodeRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        ValidateSchoolEmail(normalizedEmail);

        var user = await _userManager.FindByEmailAsync(normalizedEmail);
        if (user is null || user.EmailConfirmed)
        {
            throw new InvalidOperationException("Pro tento e-mail není aktivní žádná čekající registrace.");
        }

        var cacheKey = GetCacheKey(normalizedEmail);
        if (_memoryCache.TryGetValue<PendingCodeEntry>(cacheKey, out var existingEntry) && existingEntry is not null)
        {
            var elapsed = DateTime.UtcNow - existingEntry.CreatedAtUtc;
            if (elapsed < TimeSpan.FromSeconds(30))
            {
                var remaining = (int)Math.Ceiling((TimeSpan.FromSeconds(30) - elapsed).TotalSeconds);
                throw new InvalidOperationException($"Nový kód lze odeslat až za {remaining} s.");
            }
        }

        var code = GenerateConfirmationCode();
        var newEntry = new PendingCodeEntry
        {
            Code = code,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(15),
            AttemptCount = 0
        };

        _memoryCache.Set(cacheKey, newEntry, TimeSpan.FromMinutes(15));

        await _emailService.SendConfirmationCodeAsync(normalizedEmail, code, cancellationToken);

        return new ResendCodeResponse
        {
            Message = "Nový potvrzovací kód byl odeslán na váš školní e-mail."
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await _userManager.FindByEmailAsync(normalizedEmail);
        if (user is null)
        {
            throw new UnauthorizedAccessException("Neplatný e-mail nebo heslo.");
        }

        if (!user.EmailConfirmed)
        {
            throw new UnauthorizedAccessException("E-mail nebyl ověřen. Před přihlášením prosím zadejte potvrzovací kód z e-mailu.");
        }

        var result = await _signInManager.PasswordSignInAsync(user, request.Password, isPersistent: false, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            throw new UnauthorizedAccessException("Neplatný e-mail nebo heslo.");
        }

        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        if (roles.Count == 0)
        {
            roles.Add("student");
        }

        return new LoginResponse
        {
            Message = "Přihlášení proběhlo úspěšně.",
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.FullName ?? user.UserName ?? user.Email ?? "student",
                Roles = roles
            }
        };
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
    }

    public async Task<UserDto?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var user = await _userManager.GetUserAsync(principal);
        if (user is null)
        {
            return null;
        }

        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        if (roles.Count == 0)
        {
            roles.Add("student");
        }

        return new UserDto
        {
            Id = user.Id,
            DisplayName = user.FullName ?? user.UserName ?? user.Email ?? "student",
            Roles = roles
        };
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static void ValidateSchoolEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.EndsWith(SchoolEmailDomain, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException($"Registrace je povolena pouze se školním e-mailem {SchoolEmailDomain}.");
        }
    }

    private static string GenerateConfirmationCode()
    {
        return RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
    }

    private static string GetCacheKey(string email) => $"email_confirm_{email}";
}
