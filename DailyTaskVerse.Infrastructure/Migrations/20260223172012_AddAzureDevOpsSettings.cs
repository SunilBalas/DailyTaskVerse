using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyTaskVerse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAzureDevOpsSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AzureDevOpsSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    OrganizationUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EncryptedPat = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SelectedProjectIds = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SelectedProjectNames = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IsConnected = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AzureDevOpsSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AzureDevOpsSettings_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AzureDevOpsSettings_UserId",
                table: "AzureDevOpsSettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AzureDevOpsSettings");
        }
    }
}
