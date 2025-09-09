using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface ICategoryRepository
    {
        public Task<List<CategoryModel>> GetAllAsync();
        public Task<CategoryModel> GetByIdAsync(int id);
        public Task<CategoryModel> AddAsync(CategoryModel model);
        public Task<bool> UpdateAsync(int id, CategoryModel model);
        public Task<bool> DeleteAsync(int id);
    }
}
