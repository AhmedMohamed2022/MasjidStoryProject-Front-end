using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Models.Migrations
{
    /// <inheritdoc />
    public partial class CleanupDuplicateForeignKeys : Migration
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

            // Drop the duplicate indexes
            migrationBuilder.DropIndex(
                name: "IX_Media_MasjidId1",
                table: "Media");

            migrationBuilder.DropIndex(
                name: "IX_Media_StoryId1",
                table: "Media");

            // Drop the duplicate columns
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
            // Add back the duplicate columns (for rollback)
            migrationBuilder.AddColumn<int>(
                name: "MasjidId1",
                table: "Media",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StoryId1",
                table: "Media",
                type: "int",
                nullable: true);

            // Add back the duplicate indexes
            migrationBuilder.CreateIndex(
                name: "IX_Media_MasjidId1",
                table: "Media",
                column: "MasjidId1");

            migrationBuilder.CreateIndex(
                name: "IX_Media_StoryId1",
                table: "Media",
                column: "StoryId1");

            // Add back the duplicate foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Media_Masjids_MasjidId1",
                table: "Media",
                column: "MasjidId1",
                principalTable: "Masjids",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_Stories_StoryId1",
                table: "Media",
                column: "StoryId1",
                principalTable: "Stories",
                principalColumn: "Id");
        }
    }
} 