using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using TeacherControl.Api.Features.Login.DTOs;
using TeacherControl.Api.Features.Login.Services;

namespace TeacherControl.Api.Features.Login.Controllers;

[ApiController]
[Route("api/auth")]
public class LoginController : ControllerBase
{
    private readonly LoginService _loginService;
    private readonly ILogger<LoginController> _logger;

    public LoginController(LoginService loginService, ILogger<LoginController> logger)
    {
        _loginService = loginService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _loginService.RegisterAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Registration validation error for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Neplatný požadavek");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Registration conflict for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Registrace se nezdařila");
        }
    }

    [HttpPost("confirm-code")]
    public async Task<IActionResult> ConfirmCode([FromBody] ConfirmCodeRequest request)
    {
        try
        {
            var result = await _loginService.ConfirmCodeAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Confirm code not found for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Registrace nenalezena");
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid confirmation code provided for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Neplatný kód");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Confirmation failed for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Chyba ověření");
        }
    }

    [HttpPost("resend-code")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _loginService.ResendCodeAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid email for resend code {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Neplatný e-mail");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot resend code for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status400BadRequest, title: "Nelze odeslat kód");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _loginService.LoginAsync(request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized login attempt for {Email}", request.Email);
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status401Unauthorized, title: "Neplatné přihlašovací údaje");
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _loginService.LogoutAsync();
        return Ok(new { success = true });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _loginService.GetCurrentUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(user);
    }
}
