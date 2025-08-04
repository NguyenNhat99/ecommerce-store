using DoAnChuyenNganh.Server.Models;

namespace DoAnChuyenNganh.Server.Repository.Interfaces
{
    public interface IColorRepository
    {
        public Task<List<ColorModel>> GetAllAsync();
        public Task<ColorModel> GetByIdAsync(int id);
        public Task<ColorModel> AddAsync(ColorModel model);
        public Task<bool> UpdateAsync(int id, ColorModel model);
        public Task<bool> DeleteAsync(int id);
    }
}
