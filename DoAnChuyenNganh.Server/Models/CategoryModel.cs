using System.ComponentModel.DataAnnotations;

namespace DoAnChuyenNganh.Server.Models
{
    public class CategoryModel
    {
        public int Id { get; set; }
        [MaxLength(255)]
        public string CategoryName { get; set; } = null!;
        [MaxLength(500)]
        public string? Description { set; get; }
    }
}
