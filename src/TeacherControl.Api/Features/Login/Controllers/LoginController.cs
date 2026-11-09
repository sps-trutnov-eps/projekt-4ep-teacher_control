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
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
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
    [ProducesResponseType(typeof(ConfirmCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ConfirmCodeResponse>> ConfirmCode([FromBody] ConfirmCodeRequest request)
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
    [ProducesResponseType(typeof(ResendCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ResendCodeResponse>> ResendCode([FromBody] ResendCodeRequest request, CancellationToken cancellationToken)
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
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        await _loginService.LogoutAsync();
        return Ok(new { success = true });
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await _loginService.GetCurrentUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(user);
    }
}
