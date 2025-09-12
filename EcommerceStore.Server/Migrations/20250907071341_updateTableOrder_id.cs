using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EcommerceStore.Server.Migrations
{
    /// <inheritdoc />
    public partial class updateTableOrder_id : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Drop FK phụ thuộc vào Order.Id
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Order_OrderId",
                table: "OrderItem");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransaction_Order_OrderId",
                table: "PaymentTransaction");

            // 2) Nếu trước đó Order.Id từng là identity int, cần bỏ identity/default trước khi đổi type
            migrationBuilder.Sql(@"ALTER TABLE ""Order"" ALTER COLUMN ""Id"" DROP IDENTITY IF EXISTS;");

            // 3) Đổi kiểu cột CHÍNH trước (Order.Id → text)
            migrationBuilder.Sql(@"ALTER TABLE ""Order"" ALTER COLUMN ""Id"" TYPE text USING ""Id""::text;");

            // 4) Đổi kiểu các cột PHỤ (FK) (nếu còn chưa phải text)
            migrationBuilder.Sql(@"ALTER TABLE ""OrderItem"" ALTER COLUMN ""OrderId"" TYPE text USING ""OrderId""::text;");
            migrationBuilder.Sql(@"ALTER TABLE ""PaymentTransaction"" ALTER COLUMN ""OrderId"" TYPE text USING ""OrderId""::text;");

            // 5) Add FK lại
            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Order_OrderId",
                table: "OrderItem",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransaction_Order_OrderId",
                table: "PaymentTransaction",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Đảo ngược: drop FK → đổi về integer → add FK cũ.
            migrationBuilder.DropForeignKey("FK_OrderItem_Order_OrderId", "OrderItem");
            migrationBuilder.DropForeignKey("FK_PaymentTransaction_Order_OrderId", "PaymentTransaction");

            migrationBuilder.Sql(@"ALTER TABLE ""OrderItem"" ALTER COLUMN ""OrderId"" TYPE integer USING ""OrderId""::integer;");
            migrationBuilder.Sql(@"ALTER TABLE ""PaymentTransaction"" ALTER COLUMN ""OrderId"" TYPE integer USING ""OrderId""::integer;");
            migrationBuilder.Sql(@"ALTER TABLE ""Order"" ALTER COLUMN ""Id"" TYPE integer USING ""Id""::integer;");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Order_OrderId",
                table: "OrderItem",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransaction_Order_OrderId",
                table: "PaymentTransaction",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

    }
}
