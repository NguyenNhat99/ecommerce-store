using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcommerceStore.Server.Data
{
    [Table("WeatherRecommendation")]
    public class WeatherRecommendation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [MaxLength(50)]
        public string Condition { get; set; } = string.Empty;

        public float? MinTemp { get; set; }
        public float? MaxTemp { get; set; }

        // Khóa ngoại đến Category
        [ForeignKey("Category")]
        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; }
    }
}