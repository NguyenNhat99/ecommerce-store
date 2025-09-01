using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public class ProductImageModel
    {
        public int Id { set; get; }
        public string? ImageUrl { set; get; }
        public int ProductId { get; set; }
    }
}
