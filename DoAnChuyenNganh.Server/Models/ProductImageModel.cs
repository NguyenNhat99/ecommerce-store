using System.ComponentModel.DataAnnotations;

namespace DoAnChuyenNganh.Server.Models
{
    public class ProductImageModel
    {
        public int Id { set; get; }
        public string? ImageUrl { set; get; }
        public int ProductId { get; set; }
    }
}
