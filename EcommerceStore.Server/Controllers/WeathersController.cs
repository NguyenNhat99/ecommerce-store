using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeathersController : Controller
    {
        private readonly IWeatherRepository _weatherRepository;

        public WeathersController(IWeatherRepository weatherRepository)
        {
            _weatherRepository = weatherRepository;
        }

        /// <summary>
        /// API gợi ý sản phẩm theo thời tiết
        /// </summary>
        /// <param name="city">Tên thành phố (VD: HoChiMinh, Hanoi)</param>
        /// <returns>Thông tin thời tiết + danh sách category gợi ý</returns>
        [HttpGet]
        public async Task<ActionResult<WeatherSuggestionModel>> GetSuggestion([FromQuery] string city)
        {
            try
            {
                var result = await _weatherRepository.GetSuggestionsByCityAsync(city);
                if (result == null || result.SuggestedCategories == null || !result.SuggestedCategories.Any())
                {
                    return NotFound(new { message = "Không tìm thấy gợi ý cho thành phố này" });
                }

                return Ok(new
                {
                    city = result.City,
                    temperature = result.Temperature,
                    condition = result.Condition,
                    suggestedCategories = result.SuggestedCategories
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("by-coords")]
        public async Task<ActionResult<WeatherSuggestionModel>> GetSuggestionByCoordinates([FromQuery] double lat, [FromQuery] double lon)
        {
            try
            {
                var result = await _weatherRepository.GetSuggestionsByCoordinatesAsync(lat, lon);
                return Ok(new
                {
                    city = result.City,
                    temperature = result.Temperature,
                    condition = result.Condition,
                    suggestedCategories = result.SuggestedCategories
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// API lấy danh sách rule thời tiết (dùng cho admin)
        /// </summary>
        [HttpGet("rules")]
        public async Task<ActionResult<List<WeatherRecommendationModel>>> GetAllRules()
        {
            try
            {
                var rules = await _weatherRepository.GetAllAsync();
                if (!rules.Any()) return NotFound(new { message = "Không có rule nào" });
                return Ok(rules);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>
        /// API thêm rule thời tiết mới
        /// </summary>
        [HttpPost("rules")]
        public async Task<ActionResult<WeatherRecommendationModel>> CreateRule(WeatherRecommendationModel model)
        {
            try
            {
                var newRule = await _weatherRepository.AddAsync(model);
                if (newRule == null) return BadRequest(new { message = "Thêm rule thất bại" });
                return CreatedAtAction(nameof(GetAllRules), new { id = newRule.Id }, newRule);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>
        /// API xóa rule theo id
        /// </summary>
        [HttpDelete("rules/{id}")]
        public async Task<ActionResult<bool>> DeleteRule(int id)
        {
            try
            {
                var deleted = await _weatherRepository.DeleteAsync(id);
                if (!deleted) return BadRequest(new { message = "Xóa thất bại" });
                return NoContent();
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }
    }
}