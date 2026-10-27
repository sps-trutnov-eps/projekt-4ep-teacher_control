using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.Versioning.Services;

namespace TeacherControl.Api.Features.Versioning.Controllers;

[ApiController]
[Route("api/version")]
public class VersionController : ControllerBase
{
    private readonly VersionService _versionService;
    
    public VersionController(VersionService versionService)
    {
        _versionService = versionService;
    }
    
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(_versionService.GetVersion());
    }
}
