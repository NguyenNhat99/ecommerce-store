using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IBrandRepository
    {
        public Task<List<BrandModel>> GetAllAsync();
        public Task<BrandModel> GetByIdAsync(int id);
        public Task<BrandModel> AddAsync(BrandModel model);
        public Task<bool> UpdateAsync(int id,BrandModel model);
        public Task<bool> DeleteAsync(int id);
    }
}
