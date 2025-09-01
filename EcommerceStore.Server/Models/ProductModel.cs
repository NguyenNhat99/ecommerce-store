using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using static System.Net.Mime.MediaTypeNames;

namespace EcommerceStore.Server.Models
{
    public class ProductResponseModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreateAt { get; set; } = DateTime.UtcNow;
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; } = 0;
        public int CategoryId { get; set; }
        public int BrandId { get; set; }
        public bool IsActive { get; set; } = true;
        public string Avatar { get; set; } = string.Empty;
        public string SizeConversion { get; set; }
        public List<ProductColorModel> ProductColors { get; set; } = new List<ProductColorModel>();
        public List<ProductSizeModel> ProductSizes { get; set; } = new List<ProductSizeModel>();
        public List<ProductImageModel> Images { get; set; } = new List<ProductImageModel>(); // Danh sách hình ảnh từ bảng ProductImages
    }
    public class ProductRequestModel
    {
        public int Id { get; set; }

        [MaxLength(255)]
        public string Name { get; set; } = null!;

        [MaxLength(4000)]
        public string? Description { get; set; }

        public DateTime CreateAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? OriginalPrice { get; set; }

        public int Stock { get; set; } = 0;

        public int CategoryId { get; set; }

        public int BrandId { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(20)]
        public string SizeConversion { get; set; }
        /// <summary>
        /// Ảnh đại diện (hình chính)
        /// </summary>
        public IFormFile? Avatar { get; set; }

        /// <summary>
        /// Danh sách hình ảnh chi tiết sản phẩm
        /// </summary>
        public List<IFormFile>? Images { get; set; } = new();

        /// <summary>
        /// Danh sách kích thước sản phẩm và tồn kho
        /// </summary>
        public List<ProductSizeModel> ProductSizes { get; set; } = new();

        /// <summary>
        /// Danh sách ID màu sắc được chọn
        /// </summary>
        public List<string> ColorCodes { get; set; } = new();
    }
}
