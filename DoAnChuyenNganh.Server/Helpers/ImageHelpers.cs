using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace DoAnChuyenNganh.Server.Helpers
{
    public class ImageHelpers
    {
       
        public static async Task<string?> SaveImageAsync(IFormFile file, IWebHostEnvironment webHostEnvironment, string folder)
        {
            if (file != null)
            {
                var ext = Path.GetExtension(file.FileName);
                var newFileName = $"{Guid.NewGuid()}{ext}";

                var rootPath = webHostEnvironment.ContentRootPath;
                var folderPath = Path.Combine(rootPath, "Assets", folder);

                var filePath = Path.Combine(folderPath, newFileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                return newFileName;
            }
            return "";
        }
    }
}
