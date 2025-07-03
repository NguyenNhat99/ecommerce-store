using System.ComponentModel.DataAnnotations.Schema;

namespace DoAnChuyenNganh.Server.Data
{
    [Table("ProductSize")]
    public class ProductSize
    {
        public int ProductId { set; get; }
        public int SizeId { set; get; }
        public int Stock { set; get; }
        // Remove initialization to avoid creating empty objects
        public virtual Size Size { set; get; } = null!;
        public virtual Product Product { set; get; } = null!;
    }
}
