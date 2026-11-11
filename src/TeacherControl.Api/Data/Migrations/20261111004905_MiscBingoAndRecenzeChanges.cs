using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TeacherControl.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class MiscBingoAndRecenzeChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BingoBoards_AspNetUsers_StudentId",
                table: "BingoBoards");

            migrationBuilder.DropIndex(
                name: "IX_BingoBoards_StudentId",
                table: "BingoBoards");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "BingoBoards");

            migrationBuilder.DropColumn(
                name: "Marked",
                table: "BingoBoardQuotes");

            migrationBuilder.CreateTable(
                name: "BingoBoardQuoteMarks",
                columns: table => new
                {
                    StudentId = table.Column<string>(type: "text", nullable: false),
                    BingoBoardQuoteId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoBoardQuoteMarks", x => new { x.StudentId, x.BingoBoardQuoteId });
                    table.ForeignKey(
                        name: "FK_BingoBoardQuoteMarks_AspNetUsers_StudentId",
                        column: x => x.StudentId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BingoBoardQuoteMarks_BingoBoardQuotes_BingoBoardQuoteId",
                        column: x => x.BingoBoardQuoteId,
                        principalTable: "BingoBoardQuotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyBingoWinners",
                columns: table => new
                {
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    BoardId = table.Column<int>(type: "integer", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyBingoWinners", x => x.Date);
                    table.ForeignKey(
                        name: "FK_DailyBingoWinners_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyBingoWinners_BingoBoards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "BingoBoards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TeacherReactions",
                columns: table => new
                {
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherReactions", x => new { x.TeacherId, x.UserId });
                    table.CheckConstraint("CK_TeacherReactions_Value", "\"Value\" IN (-1, 1)");
                    table.ForeignKey(
                        name: "FK_TeacherReactions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TeacherReactions_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TextReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    AuthorId = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TextReviews_AspNetUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TextReviews_Teachers_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teachers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BingoBoardQuoteMarks_BingoBoardQuoteId",
                table: "BingoBoardQuoteMarks",
                column: "BingoBoardQuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyBingoWinners_BoardId",
                table: "DailyBingoWinners",
                column: "BoardId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyBingoWinners_UserId",
                table: "DailyBingoWinners",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherReactions_UserId",
                table: "TeacherReactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TextReviews_AuthorId",
                table: "TextReviews",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_TextReviews_TeacherId_AuthorId",
                table: "TextReviews",
                columns: new[] { "TeacherId", "AuthorId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BingoBoardQuoteMarks");

            migrationBuilder.DropTable(
                name: "DailyBingoWinners");

            migrationBuilder.DropTable(
                name: "TeacherReactions");

            migrationBuilder.DropTable(
                name: "TextReviews");

            migrationBuilder.AddColumn<string>(
                name: "StudentId",
                table: "BingoBoards",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "Marked",
                table: "BingoBoardQuotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_BingoBoards_StudentId",
                table: "BingoBoards",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_BingoBoards_AspNetUsers_StudentId",
                table: "BingoBoards",
                column: "StudentId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
