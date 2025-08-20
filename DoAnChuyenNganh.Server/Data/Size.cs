using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace DoAnChuyenNganh.Server.Data
{
    [Table("Size")]
    public class Size
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { set; get; }
        [MaxLength(10)]
        public string Name { set; get; } = null!;
        public virtual ICollection<ProductSize> ProductSizes { get; set; } = new List<ProductSize>();
    }
}
