using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TeacherControl.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FinishedBingoCount",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TeacherId",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BingoBoards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    StudentId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoBoards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BingoBoards_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Teachers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhotoUrl = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LoginName = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Mood = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teachers", x => x.Id);
                    table.CheckConstraint("CK_Teachers_Mood", "\"Mood\" BETWEEN 1 AND 5");
                });

            migrationBuilder.CreateTable(
                name: "TeacherTitles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherTitles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LateArrivals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    StudentId = table.Column<string>(type: "text", nullable: false),
                    TimeSpan = table.Column<TimeSpan>(type: "interval", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LateArrivals", x => x.Id);
                    table.CheckConstraint("CK_LateArrivals_Duration", "\"TimeSpan\" >= INTERVAL '0 seconds'");
                    table.ForeignKey(
                        name: "FK_LateArrivals_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LateArrivals_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<float>(type: "real", nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    StudentId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.CheckConstraint("CK_Reviews_Rating", "\"Rating\" BETWEEN 1 AND 5");
                    table.ForeignKey(
                        name: "FK_Reviews_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeacherQuotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Quote = table.Column<string>(type: "text", nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherQuotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherQuotes_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HistoricTitles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherTitleId = table.Column<int>(type: "integer", nullable: false),
                    WinningTeacherId = table.Column<int>(type: "integer", nullable: false),
                    Pololeti = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricTitles", x => x.Id);
                    table.CheckConstraint("CK_HistoricTitles_Pololeti", "\"Pololeti\" >= 0");
                    table.ForeignKey(
                        name: "FK_HistoricTitles_TeacherTitles_TeacherTitleId",
                        column: x => x.TeacherTitleId,
                        principalTable: "TeacherTitles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HistoricTitles_Teachers_WinningTeacherId",
                        column: x => x.WinningTeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TitleVotes",
                columns: table => new
                {
                    StudentId = table.Column<string>(type: "text", nullable: false),
                    TeacherTitleId = table.Column<int>(type: "integer", nullable: false),
                    Pololeti = table.Column<int>(type: "integer", nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    VotedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TitleVotes", x => new { x.StudentId, x.TeacherTitleId, x.Pololeti });
                    table.CheckConstraint("CK_TitleVotes_Pololeti", "\"Pololeti\" >= 0");
                    table.ForeignKey(
                        name: "FK_TitleVotes_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TitleVotes_TeacherTitles_TeacherTitleId",
                        column: x => x.TeacherTitleId,
                        principalTable: "TeacherTitles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TitleVotes_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BingoBoardQuotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BingoBoardId = table.Column<int>(type: "integer", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    QuoteId = table.Column<int>(type: "integer", nullable: false),
                    Marked = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoBoardQuotes", x => x.Id);
                    table.CheckConstraint("CK_BingoBoardQuotes_Position", "\"Position\" >= 0");
                    table.ForeignKey(
                        name: "FK_BingoBoardQuotes_BingoBoards_BingoBoardId",
                        column: x => x.BingoBoardId,
                        principalTable: "BingoBoards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BingoBoardQuotes_TeacherQuotes_QuoteId",
                        column: x => x.QuoteId,
                        principalTable: "TeacherQuotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_TeacherId",
                table: "AspNetUsers",
                column: "TeacherId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BingoBoardQuotes_BingoBoardId_Position",
                table: "BingoBoardQuotes",
                columns: new[] { "BingoBoardId", "Position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BingoBoardQuotes_QuoteId",
                table: "BingoBoardQuotes",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_BingoBoards_StudentId",
                table: "BingoBoards",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricTitles_TeacherTitleId",
                table: "HistoricTitles",
                column: "TeacherTitleId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricTitles_WinningTeacherId",
                table: "HistoricTitles",
                column: "WinningTeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_LateArrivals_StudentId",
                table: "LateArrivals",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_LateArrivals_TeacherId",
                table: "LateArrivals",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_StudentId",
                table: "Reviews",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TeacherId",
                table: "Reviews",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherQuotes_TeacherId",
                table: "TeacherQuotes",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_TitleVotes_TeacherId",
                table: "TitleVotes",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_TitleVotes_TeacherTitleId",
                table: "TitleVotes",
                column: "TeacherTitleId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Teachers_TeacherId",
                table: "AspNetUsers",
                column: "TeacherId",
                principalTable: "Teachers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Teachers_TeacherId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "BingoBoardQuotes");

            migrationBuilder.DropTable(
                name: "HistoricTitles");

            migrationBuilder.DropTable(
                name: "LateArrivals");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "TitleVotes");

            migrationBuilder.DropTable(
                name: "BingoBoards");

            migrationBuilder.DropTable(
                name: "TeacherQuotes");

            migrationBuilder.DropTable(
                name: "TeacherTitles");

            migrationBuilder.DropTable(
                name: "Teachers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_TeacherId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "FinishedBingoCount",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TeacherId",
                table: "AspNetUsers");
        }
    }
}
