using Microsoft.AspNetCore.Http;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IImageRepository
    {
        Task<string> GetByIdProductAsync(int idProduct);

        Task<(string Url, string PublicId)> AddAsync(IFormFile file, string folder);

        Task<bool> DeleteAsync(string publicId);
    }
}
