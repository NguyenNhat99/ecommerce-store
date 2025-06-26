using System.ComponentModel.DataAnnotations;

namespace DoAnChuyenNganh.Server.Models
{
    public class BrandModel
    {
        public int Id { get; set; }
        [MaxLength(255)]
        public string Name { get; set; } = null!;
        [MaxLength(500)]
        public string? Description { set; get; }
    }
}
