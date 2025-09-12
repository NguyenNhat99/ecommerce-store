using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class updateTableOrderItem_deleteSize_Color : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Color_ColorId",
                table: "OrderItem");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Size_SizeId",
                table: "OrderItem");

            migrationBuilder.DropIndex(
                name: "IX_OrderItem_ColorId",
                table: "OrderItem");

            migrationBuilder.DropIndex(
                name: "IX_OrderItem_SizeId",
                table: "OrderItem");

            migrationBuilder.DropColumn(
                name: "ColorId",
                table: "OrderItem");

            migrationBuilder.DropColumn(
                name: "SizeId",
                table: "OrderItem");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ColorId",
                table: "OrderItem",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SizeId",
                table: "OrderItem",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_ColorId",
                table: "OrderItem",
                column: "ColorId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItem_SizeId",
                table: "OrderItem",
                column: "SizeId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Color_ColorId",
                table: "OrderItem",
                column: "ColorId",
                principalTable: "Color",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Size_SizeId",
                table: "OrderItem",
                column: "SizeId",
                principalTable: "Size",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
