using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Models.Migrations
{
    /// <inheritdoc />
    public partial class FixDuplicateForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the duplicate foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_Media_Masjids_MasjidId1",
                table: "Media");

            migrationBuilder.DropForeignKey(
                name: "FK_Media_Stories_StoryId1",
                table: "Media");

            // Drop the duplicate columns
            migrationBuilder.DropIndex(
                name: "IX_Media_MasjidId1",
                table: "Media");

            migrationBuilder.DropIndex(
                name: "IX_Media_StoryId1",
                table: "Media");

            migrationBuilder.DropColumn(
                name: "MasjidId1",
                table: "Media");

            migrationBuilder.DropColumn(
                name: "StoryId1",
                table: "Media");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // This migration only removes duplicate columns, so Down() is empty
            // The original migration will handle the rollback if needed
        }
    }
} 