using EcommerceStore.Server.Models;
namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IRatingRepository
    {
        Task<List<RatingProductModel>> GetByProductIdAsync(int productId);
        Task<RatingProductModel> GetByIdAsync(int id);
        Task<RatingProductModel> AddAsync(RatingProductModel model);
        Task<bool> UpdateAsync(int id, RatingProductModel model);
        Task<bool> DeleteAsync(int id);
    }
}
