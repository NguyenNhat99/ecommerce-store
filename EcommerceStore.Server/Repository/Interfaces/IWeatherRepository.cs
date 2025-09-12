using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IWeatherRepository
    {
        Task<WeatherSuggestionModel> GetSuggestionsByCityAsync(string city);
        Task<WeatherSuggestionModel> GetSuggestionsByCoordinatesAsync(double lat, double lon);
        Task<List<WeatherRecommendationModel>> GetAllAsync();
        Task<WeatherRecommendationModel> AddAsync(WeatherRecommendationModel model);
        Task<bool> DeleteAsync(int id);
    }
}
