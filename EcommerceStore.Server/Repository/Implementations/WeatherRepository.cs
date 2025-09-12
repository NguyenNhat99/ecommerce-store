using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class WeatherRepository : IWeatherRepository
    {
        private readonly HttpClient _httpClient;
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        private string TranslateCondition(string condition)
        {
            return condition.ToLower() switch
            {
                "clear" => "Trời quang đãng",
                "clouds" => "Nhiều mây",
                "rain" => "Mưa",
                "drizzle" => "Mưa nhỏ",
                "thunderstorm" => "Dông bão",
                "snow" => "Tuyết",
                "mist" => "Sương mù",
                "fog" => "Sương mù dày",
                "haze" => "Mù sương",
                _ => condition // fallback: giữ nguyên nếu không dịch được
            };
        }

        public WeatherRepository(EcommerceStoreContext context, IMapper mapper, IConfiguration config)
        {
            _httpClient = new HttpClient();
            _context = context;
            _mapper = mapper;
            _config = config;
        }

        public async Task<WeatherSuggestionModel> GetSuggestionsByCityAsync(string city)
        {
            var apiKey = _config["OpenWeather:ApiKey"];
            var encodedCity = Uri.EscapeDataString(city);
            var url = $"https://api.openweathermap.org/data/2.5/weather?q={encodedCity}&appid={apiKey}&units=metric&lang=vi";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) throw new Exception("Không lấy được dữ liệu thời tiết");

            var json = JObject.Parse(await response.Content.ReadAsStringAsync());
            var temp = (float)json["main"]["temp"];
            var condition = (string)json["weather"][0]["main"];
            var translatedCondition = TranslateCondition(condition);

            // Lấy tất cả rule match condition + nhiệt độ
            var recs = await _context.WeatherRecommendations
                .Include(r => r.Category)
                .Where(r =>
                    r.Condition.ToLower() == condition.ToLower() &&
                    (r.MinTemp == null || temp >= r.MinTemp) &&
                    (r.MaxTemp == null || temp <= r.MaxTemp))
                .OrderBy(r => r.MinTemp)
                .ToListAsync();

            // Nếu không có rule match nhiệt độ → lấy tất cả rule chỉ match condition
            if (!recs.Any())
            {
                recs = await _context.WeatherRecommendations
                    .Include(r => r.Category)
                    .Where(r => r.Condition.ToLower() == condition.ToLower())
                    .ToListAsync();
            }

            // Trả về list category name
            return new WeatherSuggestionModel
            {
                City = encodedCity,
                Temperature = temp,
                Condition = translatedCondition,
                SuggestedCategories = recs.Select(r => r.Category.CategoryName).Distinct().ToList()
            };
        }

        public async Task<WeatherSuggestionModel> GetSuggestionsByCoordinatesAsync(double lat, double lon)
        {
            var apiKey = _config["OpenWeather:ApiKey"];
            var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apiKey}&units=metric&lang=vi";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) throw new Exception("Không lấy được dữ liệu thời tiết");

            var json = JObject.Parse(await response.Content.ReadAsStringAsync());
            var temp = (float)json["main"]["temp"];
            var condition = (string)json["weather"][0]["main"];
            var translatedCondition = TranslateCondition(condition);

            // Lấy tất cả rule match condition + nhiệt độ
            var recs = await _context.WeatherRecommendations
                .Include(r => r.Category)
                .Where(r =>
                    r.Condition.ToLower() == condition.ToLower() &&
                    (r.MinTemp == null || temp >= r.MinTemp) &&
                    (r.MaxTemp == null || temp <= r.MaxTemp))
                .OrderBy(r => r.MinTemp)
                .ToListAsync();

            // Nếu không có rule match nhiệt độ → lấy tất cả rule chỉ match condition
            if (!recs.Any())
            {
                recs = await _context.WeatherRecommendations
                    .Include(r => r.Category)
                    .Where(r => r.Condition.ToLower() == condition.ToLower())
                    .ToListAsync();
            }

            // Trả về list category name
            return new WeatherSuggestionModel
            {
                City = (string)json["name"],
                Temperature = temp,
                Condition = translatedCondition,
                SuggestedCategories = recs.Select(r => r.Category.CategoryName).Distinct().ToList()
            };
        }

        public async Task<List<WeatherRecommendationModel>> GetAllAsync()
        {
            var entities = await _context.WeatherRecommendations.Include(r => r.Category).ToListAsync();
            var models = _mapper.Map<List<WeatherRecommendationModel>>(entities);
            // Map thêm CategoryName
            foreach (var m in models)
            {
                var entity = entities.First(e => e.Id == m.Id);
                m.CategoryName = entity.Category?.CategoryName;
            }
            return models;
        }

        public async Task<WeatherRecommendationModel> AddAsync(WeatherRecommendationModel model)
        {
            var entity = _mapper.Map<WeatherRecommendation>(model);
            _context.WeatherRecommendations.Add(entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<WeatherRecommendationModel>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.WeatherRecommendations.FindAsync(id);
            if (entity == null) return false;
            _context.WeatherRecommendations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
