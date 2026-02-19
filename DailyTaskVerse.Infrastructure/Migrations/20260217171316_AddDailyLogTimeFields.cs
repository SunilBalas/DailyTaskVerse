using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyTaskVerse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyLogTimeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "FromTime",
                table: "DailyLogs",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ToTime",
                table: "DailyLogs",
                type: "time",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FromTime",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "ToTime",
                table: "DailyLogs");
        }
    }
}
