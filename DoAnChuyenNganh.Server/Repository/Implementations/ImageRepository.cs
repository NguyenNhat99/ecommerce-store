using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DoAnChuyenNganh.Server.Repository.Implementations
{
    public class ImageRepository : IImageRepository
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly EcommerceStoreContext _context;

        public ImageRepository(IWebHostEnvironment webHostEnvironment, EcommerceStoreContext context) 
        {
            _webHostEnvironment = webHostEnvironment;
            _context = context;
        }
        public async Task<string> AddAsync(IFormFile file, string folder)
        {
            if (file != null)
            {
                var ext = Path.GetExtension(file.FileName);
                var newFileName = $"{Guid.NewGuid()}{ext}";

                var rootPath = _webHostEnvironment.ContentRootPath;
                var folderPath = Path.Combine(rootPath, "wwwroot/Assets", folder);

                var filePath = Path.Combine(folderPath, newFileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                return newFileName;
            }
            return "";
        }

        public async Task<bool> DeleteAsync(string fileName, string folder)
        {
            if (string.IsNullOrEmpty(fileName)) return false;

            var rootPath = _webHostEnvironment.ContentRootPath;
            var folderPath = Path.Combine(rootPath, "wwwroot/Assets", folder);
            var filePath = Path.Combine(folderPath, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }
            return false;
        }

        public async Task<string> GetByIdProductAsync(int idProduct)
        {
            var image =await _context.ProductImages.FirstOrDefaultAsync(p => p.Id == idProduct);
            if (image == null) return "";
            return image.ImageUrl;
        }
    }
}
