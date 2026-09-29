using Microsoft.AspNetCore.Mvc;
using TeacherControl.Api.Features.Abstence.Controllers;
using TeacherControl.Api.Features.TeacherBingo.Services;

namespace TeacherControl.Api.Features.TeacherBingo.Controllers;

public class TeacherBingoController : ControllerBase
{
    private ILogger<AbstenceController> _logger;
    private TeacherBingoService _teacherBingoService;
    
    public TeacherBingoController(ILogger<AbstenceController> logger, TeacherBingoService teacherBingoService)
    {
        _logger = logger;
        _teacherBingoService = teacherBingoService;
    }
}