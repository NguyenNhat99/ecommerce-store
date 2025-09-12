namespace EcommerceStore.Server.Models
{
    public class WeatherSuggestionModel
    {
        public string City { get; set; }
        public float Temperature { get; set; }
        public string Condition { get; set; }
        public List<string> SuggestedCategories { get; set; } = new List<string>();
    }
}