using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public class ColorModel
    {
        public int Id { set; get; }
        public string CodeColor { set; get; } = null!;
    }
}
