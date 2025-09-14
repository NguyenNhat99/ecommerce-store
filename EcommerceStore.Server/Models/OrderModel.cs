using EcommerceStore.Server.Data;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public sealed class OrderItemResponseModel
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }          // it.Product?.Name
        public string? Sku { get; set; }
        public string? ImageUrl { get; set; }            // ảnh nhận diện nếu có
        public int Quantity { get; set; }                // it.Quantity
        public decimal UnitPrice { get; set; }           // it.UnitPrice (hoặc Price)
        public decimal LineTotal => Quantity * UnitPrice; // tiện cho FE, có thể bỏ nếu muốn
    }

    public sealed class OrderResponseModel
    {
        public string Id { get; set; }
        public string? UserId { get; set; }
        public string? AnonymousId { get; set; }
        public DateTime OrderDate { get; set; }

        // Khuyến nghị: dùng enum + JSON string, còn không thì giữ string như hiện tại
        public string OrderStatus { get; set; }

        // Tổng cuối cùng (đã gồm ship/giảm giá nếu có)
        public decimal TotalAmount { get; set; }

        public string? CustomerName { get; set; }     // nên để nullable vì DB có thể null
        public string? CustomerPhone { get; set; }    // "
        public string? CustomerEmail { get; set; }    // "
        public string? ShippingAddress { get; set; }  // "
        public string? Note { get; set; }

        // Thanh toán
        public string? PaymentMethod { get; set; } // vnp, cod
        public string? PaymentStatus { get; set; } // Pending, Paid, Failed, ...
        public string? TransactionId { get; set; }
        public DateTime? PaymentDate { get; set; }

        // >>> THÊM MỚI:
        public List<OrderItemResponseModel> Items { get; set; } = new();

        // (tuỳ chọn) Các tổng phụ để FE hiển thị rõ ràng
        public decimal? Subtotal { get; set; }        // sum(items)
        public decimal? ShippingFee { get; set; }     // nếu có
        public decimal? DiscountAmount { get; set; }  // nếu có
                                                      // public decimal GrandTotal => (Subtotal ?? 0) + (ShippingFee ?? 0) - (DiscountAmount ?? 0);
    }
    public class OrderRequestModel
    {
        public string CustomerName { get; set; } = null!;
        public string CustomerPhone { get; set; } = null!;
        public string CustomerEmail { get; set; } = null!;
        public string ShippingAddress { get; set; } = null!;
        public string? Note { get; set; }

        // FE chỉ gửi phương thức: COD hay VNPay
        public string PaymentMethod { get; set; } = null!;

    }
    public class OrderTrackDto
    {
        public string Id { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string PaymentMethod { get; set; } = null!;
        public decimal TotalAmount { get; set; }

        // hiển thị nhanh vài món hàng
        public List<OrderTrackItemDto> Items { get; set; } = new();
        public class OrderTrackItemDto
        {
            public string ProductName { get; set; } = "";
            public int Quantity { get; set; }
            public decimal UnitPrice { get; set; }
        }
    }
}
