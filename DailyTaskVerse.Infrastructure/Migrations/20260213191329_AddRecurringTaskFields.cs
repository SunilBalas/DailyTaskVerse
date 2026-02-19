using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyTaskVerse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurringTaskFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRecurring",
                table: "Tasks",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RecurrencePattern",
                table: "Tasks",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRecurring",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "RecurrencePattern",
                table: "Tasks");
        }
    }
}
