using Microsoft.AspNetCore.Identity;
using TeacherControl.Api.Entities;

namespace TeacherControl.Api.Data;

public static class DevelopmentAuthentication
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        var email = configuration["DevelopmentUser:Email"];
        var password = configuration["DevelopmentUser:Password"];
        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(password))
            return;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Configure both DevelopmentUser:Email and DevelopmentUser:Password.");

        using var scope = services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<UserEntity>>();
        if (await users.FindByEmailAsync(email) is not null)
            return;

        var result = await users.CreateAsync(new UserEntity
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        }, password);

        if (!result.Succeeded)
            throw new InvalidOperationException("Could not create development user: " +
                string.Join("; ", result.Errors.Select(error => error.Description)));
    }

    public static void MapDevelopmentAuthentication(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Development authentication");

        group.MapPost("/login", async (LoginRequest request, SignInManager<UserEntity> signInManager) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return Results.BadRequest();

            var user = await signInManager.UserManager.FindByEmailAsync(request.Email);
            if (user is null)
                return Results.Unauthorized();

            var result = await signInManager.PasswordSignInAsync(user, request.Password,
                isPersistent: false, lockoutOnFailure: true);
            return result.Succeeded ? Results.NoContent() : Results.Unauthorized();
        }).AllowAnonymous();

        group.MapPost("/logout", async (SignInManager<UserEntity> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.NoContent();
        }).RequireAuthorization();

        group.MapGet("/me", async (HttpContext context, UserManager<UserEntity> users) =>
        {
            var user = await users.GetUserAsync(context.User);
            return user is null
                ? Results.Unauthorized()
                : Results.Ok(new { user.Id, user.UserName, user.Email });
        }).RequireAuthorization();
    }

    public sealed record LoginRequest(string Email, string Password);
}
