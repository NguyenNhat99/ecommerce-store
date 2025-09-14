using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IBlogRepository
    {
        Task<IEnumerable<BlogPostResponseModel>> GetAllAsync();
        Task<IEnumerable<BlogPostResponseModel>> GetAllEnableAsync();
        Task<IEnumerable<BlogPostResponseModel>> GetAllAsync(bool includeDraft); // NEW
        Task<BlogPostResponseModel?> GetByIdAsync(int id);
        Task<BlogPostResponseModel?> GetOneAnyAsync(int id); // NEW (admin view)
        Task<BlogPostResponseModel> AddAsync(BlogPostFormModel model, string authorId); // NEW (multipart)
        Task<BlogPostResponseModel> AddAsync(BlogPostRequestModel model, string authorId); // giữ bản cũ (JSON)
        Task<BlogPostResponseModel?> UpdateAsync(int id, BlogPostFormModel model); // NEW (multipart)
        Task<BlogPostResponseModel?> UpdateAsync(int id, BlogPostRequestModel model); // giữ bản cũ (JSON)
        Task<bool> DeleteAsync(int id);
    }
}
