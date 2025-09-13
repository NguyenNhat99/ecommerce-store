using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public class WeatherRecommendationModel
    {
        public int Id { get; set; }
        [MaxLength(50)]
        public string Condition { get; set; }
        public float? MinTemp { get; set; }
        public float? MaxTemp { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; } // tiện cho FE
    }
}