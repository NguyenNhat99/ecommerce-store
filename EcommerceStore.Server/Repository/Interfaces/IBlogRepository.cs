using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IBlogRepository
    {
        Task<IEnumerable<BlogPostResponseModel>> GetAllAsync();
        Task<BlogPostResponseModel?> GetByIdAsync(int id);
        Task<BlogPostResponseModel> AddAsync(BlogPostRequestModel model, string authorId);
        Task<BlogPostResponseModel?> UpdateAsync(int id, BlogPostRequestModel model);
        Task<bool> DeleteAsync(int id);
    }
}
