using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceStore.Server.Data
{
    [Table("Order")]
    public class Order
    {
        [Key]
        public string Id { get; set; } = null!;

        [MaxLength(450)]
        public string? UserId { get; set; }
        public virtual User? User { get; set; }

        [MaxLength(64)]
        public string? AnonymousId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string OrderStatus { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(100)]
        public string CustomerName { get; set; } = null!;

        [MaxLength(15)]
        public string CustomerPhone { get; set; } = null!;

        [MaxLength(255)]
        public string CustomerEmail { get; set; } = null!;

        [MaxLength(500)]
        public string ShippingAddress { get; set; } = null!;

        [MaxLength(500)]
        public string? Note { get; set; }

        // VNPay payment fields
        [MaxLength(20)]
        public string? PaymentMethod { get; set; } // VNPay, COD

        [MaxLength(20)]
        public string? PaymentStatus { get; set; } // Pending, Paid, Failed

        [MaxLength(255)]
        public string? TransactionId { get; set; } // VNPay transaction ID

        public DateTime? PaymentDate { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}