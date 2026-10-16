using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeacherControl.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UcitelOmezeniSubmissionu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastSubmissionAt",
                table: "Teachers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastSubmissionAt",
                table: "Teachers");
        }
    }
}
