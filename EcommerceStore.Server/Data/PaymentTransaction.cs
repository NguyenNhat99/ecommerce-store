using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceStore.Server.Data
{
    [Table("PaymentTransaction")]
    public class PaymentTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string OrderId { get; set; } = null!;
        public virtual Order Order { get; set; } = null!;

        [MaxLength(50)]
        public string TransactionId { get; set; } = null!; // VNPay transaction ID

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Success, Failed

        [MaxLength(500)]
        public string? Message { get; set; }

        [MaxLength(20)]
        public string? BankCode { get; set; }

        [MaxLength(255)]
        public string? PayDate { get; set; } // VNPay response date

        [MaxLength(500)]
        public string? ResponseData { get; set; } // Raw response from VNPay
    }
}