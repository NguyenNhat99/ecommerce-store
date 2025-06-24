using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DoAnChuyenNganh.Server.Data
{
    [Table("Brand")]
    public class Brand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [MaxLength(255)]
        public string Name { get; set; } = null!;
        [MaxLength(500)]
        public string? Description { set; get; }
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
