using TeacherControl.Api.Data;

namespace TeacherControl.Api.Features.TeacherBingo.Services;

public sealed partial class TeacherBingoService
{
    private readonly AppDbContext db;
    private const int DefaultBoardSize = 3;

    public TeacherBingoService(AppDbContext db)
    {
        this.db = db;
    }
}
