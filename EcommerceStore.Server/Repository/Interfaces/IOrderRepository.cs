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
        /// <summary>
        /// Cập nhật trạng thái THANH TOÁN (Pending/Paid/Failed/Refunded/Processing).
        /// Nếu set "Paid" mà PaymentDate chưa có thì tự gán UtcNow.
        /// </summary>
        Task<bool> UpdatePaymentStatusAsync(string id, string paymentStatus);

        /// <summary>
        /// Cập nhật trạng thái ĐƠN HÀNG
        /// (awaitpay/pend/processing/shipped/success/cancel/err).
        /// </summary>
        Task<bool> UpdateOrderStatusAsync(string id, string orderStatus);

        //Task<ProductResponseModel> AddAsync(ProductRequestModel model);
        //Task<bool> UpdateAsync(int id, ProductRequestModel model);
        //Task<bool> DeleteAsync(int id);

    }
}
