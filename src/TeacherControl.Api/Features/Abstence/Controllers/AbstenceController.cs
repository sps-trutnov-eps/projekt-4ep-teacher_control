using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.Abstence.Services;

namespace TeacherControl.Api.Features.Abstence.Controllers;

public class AbstenceController : ControllerBase
{
    private ILogger<AbstenceController> _logger;
    private AbstenceService _abstenceService;
    
    public AbstenceController(ILogger<AbstenceController> logger, AbstenceService abstenceService)
    {
        _logger = logger;
        _abstenceService = abstenceService;
    }
}