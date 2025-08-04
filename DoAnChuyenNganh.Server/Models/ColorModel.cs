using System.ComponentModel.DataAnnotations;

namespace DoAnChuyenNganh.Server.Models
{
    public class ColorModel
    {
        public int Id { set; get; }
        public string Name { set; get; } = null!;
        public string CodeColor { set; get; } = null!;
    }
}
