using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GharBazar.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "email_otp",
                table: "users",
                type: "varchar(255)",
                nullable: true,
                collation: "utf8mb4_unicode_ci")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "email_otp_expiry",
                table: "users",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_email_verified",
                table: "users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "email_otp",
                table: "users");

            migrationBuilder.DropColumn(
                name: "email_otp_expiry",
                table: "users");

            migrationBuilder.DropColumn(
                name: "is_email_verified",
                table: "users");
        }
    }
}
