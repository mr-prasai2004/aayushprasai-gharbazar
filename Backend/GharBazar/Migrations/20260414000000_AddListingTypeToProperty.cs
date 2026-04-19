using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GharBazar.API.Migrations
{
    /// <inheritdoc />
    public partial class AddListingTypeToProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "listing_type",
                table: "properties",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "For Sale");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "listing_type",
                table: "properties");
        }
    }
}
