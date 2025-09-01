using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Data
{
    [Table("Category")]
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [MaxLength(255)]
        public string CategoryName { get; set; } = null!;
        [MaxLength(500)]
        public string? Description { set; get; }
        public virtual ICollection<Product> Products { set; get; } = new List<Product>();
    }
}
