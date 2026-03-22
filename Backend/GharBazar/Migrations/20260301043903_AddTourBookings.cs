using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GharBazar.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTourBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Table 'tour_bookings' already exists in the database
            // migrationBuilder.CreateTable(...);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tour_bookings");
        }
    }
}
