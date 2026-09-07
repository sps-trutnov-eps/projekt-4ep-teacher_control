using TeacherControl.Api.Features.Abstence.Services;
using TeacherControl.Api.Features.TeacherBingo.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Data;
using TeacherControl.Api.Entities;

namespace TeacherControl.Api;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddOpenApi();
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection.")));
        builder.Services.AddIdentity<UserEntity, IdentityRole>(options =>
            options.User.RequireUniqueEmail = true)
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();
        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });
        builder.Services.AddAuthorization();

        // takhle si registrujte service soubory pro DependencyInjection
        builder.Services.AddScoped<AbstenceService>();
        builder.Services.AddScoped<TeacherBingoService>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
            await DevelopmentAuthentication.SeedAsync(app.Services, app.Configuration);
            app.MapDevelopmentAuthentication();
        }

        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();


        app.MapControllers();

        await app.RunAsync();
    }
}
