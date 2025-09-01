using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceStore.Server.Data
{
    [Table("RatingProduct")]
    public class RatingProduct
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { set; get; }
        public string Email { set; get; } = null!;
        public int ProductId { set; get; } 
        public int Rating { set; get; }
        public string Comment { set; get; } = string.Empty;
        public virtual Product Product { set; get; } = null!;
        public virtual User User { set; get; } = null!;
    }
}
