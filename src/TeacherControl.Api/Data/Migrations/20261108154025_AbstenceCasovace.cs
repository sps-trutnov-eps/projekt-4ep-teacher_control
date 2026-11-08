using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeacherControl.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AbstenceCasovace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LastSubmissionAt",
                table: "Teachers",
                newName: "LastMoodSubmissionAt");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLateArrivalSubmissionAt",
                table: "Teachers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastLateArrivalSubmissionAt",
                table: "Teachers");

            migrationBuilder.RenameColumn(
                name: "LastMoodSubmissionAt",
                table: "Teachers",
                newName: "LastSubmissionAt");
        }
    }
}
