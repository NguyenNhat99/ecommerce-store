using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Data
{
    [Table("ProductImage")]
    public class ProductImage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { set; get; }
        [MaxLength(2083)]
        public string? ImageUrl { set; get; }
        [MaxLength(512)]
        public string? PublicId { get; set; }
        public int ProductId { get; set; }

        public virtual Product Product { get; set; } = null!;

    }
}
