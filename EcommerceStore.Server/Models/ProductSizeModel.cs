namespace EcommerceStore.Server.Models
{
    public class ProductSizeModel
    {
        public int? SizeId { get; set; }  // Nếu có sẵn SizeId thì dùng
        public string? SizeName { get; set; }  // Nếu Size chưa có, dùng SizeName để tạo mới
        public int Stock { get; set; }  // Số lượng tồn kho cho kích thước đó
    }
}
