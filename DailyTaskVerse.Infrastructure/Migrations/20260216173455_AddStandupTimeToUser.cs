using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyTaskVerse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStandupTimeToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "StandupTime",
                table: "AspNetUsers",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 10, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StandupTime",
                table: "AspNetUsers");
        }
    }
}
