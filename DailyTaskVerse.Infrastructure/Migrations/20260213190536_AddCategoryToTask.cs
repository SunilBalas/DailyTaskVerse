using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyTaskVerse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryToTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Tasks",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Tasks");
        }
    }
}
