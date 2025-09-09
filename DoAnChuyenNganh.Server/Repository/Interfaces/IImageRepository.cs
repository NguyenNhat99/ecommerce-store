using DoAnChuyenNganh.Server.Models;

namespace DoAnChuyenNganh.Server.Repository.Interfaces
{
    public interface IImageRepository
    {
        public Task<string> GetByIdProductAsync(int idProduct);
        public Task<string> AddAsync(IFormFile file, string folder);
        public Task<bool> DeleteAsync(string fileName, string folder);
        //public Task<bool> UpdateAsync(int id, CategoryModel model);
        //public Task<bool> DeleteAsync(int id);
    }
}
