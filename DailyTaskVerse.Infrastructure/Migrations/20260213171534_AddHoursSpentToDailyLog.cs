using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyTaskVerse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHoursSpentToDailyLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "HoursSpent",
                table: "DailyLogs",
                type: "decimal(4,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HoursSpent",
                table: "DailyLogs");
        }
    }
}
