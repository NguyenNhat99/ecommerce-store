using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoAnChuyenNganh.Server.Data
{
    [Table("Color")]
    public class Color
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { set; get; }
        [MaxLength(255)]
        public string Name { set; get; } = null!;
        [MaxLength(20)]
        public string CodeColor { set; get; } = null!;
        public virtual ICollection<ProductColor> ProductColors { get; set; } = new List<ProductColor>();
    }
}
