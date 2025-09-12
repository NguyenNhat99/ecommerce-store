using EcommerceStore.Server.Data;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public class OrderResponseModel
    {
        public string Id { get; set; }
        public string? UserId { get; set; }
        public string? AnonymousId { get; set; }
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public string CustomerName { get; set; } 
        public string CustomerPhone { get; set; } 
        public string CustomerEmail { get; set; } 
        public string ShippingAddress { get; set; } 
        public string? Note { get; set; }

        // VNPay payment fields
        public string? PaymentMethod { get; set; } // VNPay, COD
        public string? PaymentStatus { get; set; } // Pending, Paid, Failed
        public string? TransactionId { get; set; } // VNPay transaction ID
        public DateTime? PaymentDate { get; set; }
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
}
