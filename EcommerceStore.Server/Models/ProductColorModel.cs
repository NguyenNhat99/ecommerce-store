using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public class ProductColorModel
    {
        public int Id { set; get; }
        public string Name { set; get; } = null!;
        public string CodeColor { set; get; } = null!;
    }
}
