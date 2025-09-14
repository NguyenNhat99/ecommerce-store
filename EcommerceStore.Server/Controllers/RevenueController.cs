using EcommerceStore.Server.Repository.Implementations;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueRepository _revenueRepository;

        public record RevenueSummaryDto(
    decimal TotalRevenue, int TotalOrders, int Refunds, decimal RefundAmount,
    int VnpCount, int CodCount, decimal Aov);

        public record RevenueByDayRow(string Day, decimal Amount);
        public record TopProductRow(string Name, string Category, int Qty, decimal Revenue);
        public record CategoryRevenueRow(string Category, decimal Revenue, double Pct);
        public RevenueController(IRevenueRepository revenueRepository) {
            _revenueRepository = revenueRepository;
        }
        [HttpGet("reports/summary")]
        public async Task<IActionResult> GetRevenueSummary([FromQuery] string from, [FromQuery] string to)
        {
            if (!DateOnly.TryParse(from, out var dFrom) || !DateOnly.TryParse(to, out var dTo))
                return BadRequest(new { message = "from/to phải có định dạng YYYY-MM-DD" });

            var dto = await _revenueRepository.GetRevenueSummaryAsync(dFrom, dTo);
            return Ok(dto);
        }

        [HttpGet("reports/by-day")]
        public async Task<IActionResult> GetRevenueByDay([FromQuery] string from, [FromQuery] string to)
        {
            if (!DateOnly.TryParse(from, out var dFrom) || !DateOnly.TryParse(to, out var dTo))
                return BadRequest(new { message = "from/to phải có định dạng YYYY-MM-DD" });

            var rows = await _revenueRepository.GetRevenueByDayAsync(dFrom, dTo);
            return Ok(rows);
        }

        [HttpGet("reports/top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] string from, [FromQuery] string to, [FromQuery] int top = 5)
        {
            if (!DateOnly.TryParse(from, out var dFrom) || !DateOnly.TryParse(to, out var dTo))
                return BadRequest(new { message = "from/to phải có định dạng YYYY-MM-DD" });

            if (top <= 0) top = 5;
            if (top > 50) top = 50;

            var rows = await _revenueRepository.GetTopProductsAsync(dFrom, dTo, top);
            return Ok(rows);
        }

        [HttpGet("reports/category-revenue")]
        public async Task<IActionResult> GetCategoryRevenue([FromQuery] string from, [FromQuery] string to)
        {
            if (!DateOnly.TryParse(from, out var dFrom) || !DateOnly.TryParse(to, out var dTo))
                return BadRequest(new { message = "from/to phải có định dạng YYYY-MM-DD" });

            var rows = await _revenueRepository.GetCategoryRevenueAsync(dFrom, dTo);
            return Ok(rows);
        }
        [HttpGet("total")]
        public async Task<IActionResult> GetTotalRevenue()
        {
            var total = await _revenueRepository.GetTotalRevenueAsync();
            return Ok(new { total });
        }


    }
}
