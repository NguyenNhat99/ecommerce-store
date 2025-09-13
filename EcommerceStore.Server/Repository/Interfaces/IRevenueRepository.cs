using static EcommerceStore.Server.Controllers.RevenueController;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IRevenueRepository
    {
        Task<RevenueSummaryDto> GetRevenueSummaryAsync(DateOnly from, DateOnly to);
        Task<List<RevenueByDayRow>> GetRevenueByDayAsync(DateOnly from, DateOnly to);
        Task<List<TopProductRow>> GetTopProductsAsync(DateOnly from, DateOnly to, int top);
        Task<List<CategoryRevenueRow>> GetCategoryRevenueAsync(DateOnly from, DateOnly to);
    }
}
