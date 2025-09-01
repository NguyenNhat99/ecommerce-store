using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
namespace EcommerceStore.Server.Repository.Implementations
{
    public class ImageRepository : IImageRepository
    {
        private readonly Cloudinary _cloudinary;
        private readonly EcommerceStoreContext _context;
        private readonly string _rootFolder;

        public ImageRepository(IConfiguration configuration, EcommerceStoreContext context)
        {
            // Lấy config Cloudinary từ appsettings.json
            var account = new Account(
                configuration["Cloudinary:CloudName"],
                configuration["Cloudinary:ApiKey"],
                configuration["Cloudinary:ApiSecret"]
            );

            _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
            _context = context;
            _rootFolder = configuration["Cloudinary:FolderRoot"] ?? "EcommerceStore";
        }

        public async Task<(string Url, string PublicId)> AddAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                return (string.Empty, string.Empty);

            await using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"{_rootFolder}/{folder}".Trim('/'),
                UseFilename = false,
                UniqueFilename = true,
                Overwrite = false,
                // Nếu muốn nén tự động:
                // Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            return (
                result.SecureUrl?.ToString() ?? string.Empty,
                result.PublicId ?? string.Empty
            );
        }

        public async Task<bool> DeleteAsync(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId)) return false;

            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = CloudinaryDotNet.Actions.ResourceType.Image
            };

            var result = await _cloudinary.DestroyAsync(deletionParams);
            return result.Result == "ok";
        }

        public async Task<string> GetByIdProductAsync(int idProduct)
        {
            // Lưu ý: Id ở đây là Id của ProductImage; nếu bạn muốn theo ProductId, sửa điều kiện lại cho đúng
            var image = await _context.ProductImages.FirstOrDefaultAsync(p => p.Id == idProduct);
            return image?.ImageUrl ?? string.Empty;
        }
    }
}
