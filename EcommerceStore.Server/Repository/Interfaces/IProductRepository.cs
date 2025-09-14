using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IProductRepository
    {
        public Task<List<ProductResponseModel>> GetAllAsync();
        public Task<ProductResponseModel> GetByIdAsync(int id);
        public Task<ProductResponseModel> AddAsync(ProductRequestModel model);
        public Task<bool> UpdateAsync(int id, ProductRequestModel model);
        public Task<bool> DeleteAsync(int id);
        public Task<int> CountProductsAsync();
    }
}
