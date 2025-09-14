using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IOrderRepository
    {
        Task<OrderResponseModel> CreateCodOrderAsync(OrderRequestModel model);
        Task<(OrderResponseModel, string paymentUrl)> CreateVnPayOrderAsync(OrderRequestModel model);
        Task<List<OrderResponseModel>> GetAllAsync();
        Task<OrderResponseModel> GetByIdAsync(string id);
        Task<List<OrderResponseModel>> MyOrder();
        Task<bool> UpdatePaymentStatusAsync(string id, string paymentStatus);
        Task<bool> UpdateOrderStatusAsync(string id, string orderStatus);
        Task<int> countOrderPending();
        Task<List<OrderResponseModel>> GetRecentAsync(int limit = 6);
        Task<OrderTrackDto?> PublicTrackAsync(string orderId, string contact);
    }
}
