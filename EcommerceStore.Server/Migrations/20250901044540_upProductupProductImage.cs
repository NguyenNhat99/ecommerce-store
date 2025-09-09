using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class upProductupProductImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "ProductImage",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarPublicId",
                table: "Product",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "ProductImage");

            migrationBuilder.DropColumn(
                name: "AvatarPublicId",
                table: "Product");
        }
    }
}
