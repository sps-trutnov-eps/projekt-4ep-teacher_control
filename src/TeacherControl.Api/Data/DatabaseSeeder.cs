using Microsoft.EntityFrameworkCore;
using TeacherControl.Api.Entities;

namespace TeacherControl.Api.Data;

public static class DatabaseSeeder
{
    private static readonly (string Name, float Mood, string? Quote)[] Teachers =
    [
        // nejsou všichni, jen ty co mě zrovna napadli
        ("Vladislav Sauer", 3, null),
        ("Jakub Lattenberg", 3, null),
        ("Jan Šimeček", 3, "Fetu je ve světě dost."),
        ("Jan Nymš", 3, "Pézetka."),
        ("Petr Košátko", 3, null),
        ("Pavel Bárta", 3, null),
        ("Marek Tůma", 3, null),
        ("Jakub Šenkýř", 3, "Nebudu to dělat!"),
        ("Tomáš Vaněk", 3, null),
        ("Václav Loufek", 3, null),
        ("Jaroslav Kabrhel", 3, null),
        ("Martina Pradáčová", 3, null)
    ];

    private static readonly string[] TeacherTitles =
    [
        "Učitel roku",
        "Král/královna hlášek",
        "Nejlepší vysvětlení",
        "Největší sympaťák"
    ];

    public static async Task SeedAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var existingTeachers = await db.Teachers.ToListAsync();
        foreach (var (name, mood, quote) in Teachers)
        {
            var teacher = existingTeachers.FirstOrDefault(item => item.Name == name);
            if (teacher is null)
            {
                teacher = new TeacherEntity { Name = name, Mood = mood };
                db.Teachers.Add(teacher);
                existingTeachers.Add(teacher);
            }

            if (await db.TeacherQuotes.AnyAsync(item => item.Teacher == teacher && item.Quote == quote)) continue;
            if (quote is not null)
            {
                db.TeacherQuotes.Add(new TeacherQuoteEntity
                {
                    TeacherId = teacher.Id,
                    Teacher = teacher,
                    Quote = quote
                });
            }
        }

        var existingTitles = await db.TeacherTitles
            .Select(title => title.Title)
            .ToListAsync();
        foreach (var title in TeacherTitles.Except(existingTitles))
        {
            db.TeacherTitles.Add(new TeacherTitleEntity { Title = title });
        }

        await db.SaveChangesAsync();
    }
}
