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
        //Task<ProductResponseModel> AddAsync(ProductRequestModel model);
        //Task<bool> UpdateAsync(int id, ProductRequestModel model);
        //Task<bool> DeleteAsync(int id);

    }
}
