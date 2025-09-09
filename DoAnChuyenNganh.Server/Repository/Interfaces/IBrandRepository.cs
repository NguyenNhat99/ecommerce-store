using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;

namespace DoAnChuyenNganh.Server.Repository.Interfaces
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
