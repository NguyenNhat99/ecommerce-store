using System.ComponentModel.DataAnnotations.Schema;

namespace DoAnChuyenNganh.Server.Data
{
    [Table("ProductColor")]
    public class ProductColor
    {
        public int ProductId { set; get; }
        public int ColorId { set; get; }
        public virtual Product Product { set; get; } = null!;
        public virtual Color Color { set; get; } = null!;
    }
}
