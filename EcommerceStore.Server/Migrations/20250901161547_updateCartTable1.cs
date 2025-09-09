using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class updateCartTable1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnonymousId",
                table: "Cart",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnonymousId",
                table: "Cart");
        }
    }
}
