using AutoMapper;
using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DoAnChuyenNganh.Server.Repository.Implementations
{
    public class ColorRepository : IColorRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;

        public ColorRepository(EcommerceStoreContext context, IMapper mapper) {
            _context = context;
            _mapper = mapper;
        }
        public async Task<ColorModel> AddAsync(ColorModel model)
        {
            if(model == null) throw new NotImplementedException();
            var newColor = _mapper.Map<Color>(model);
            _context.Colors.Add(newColor);
            await _context.SaveChangesAsync();
            return _mapper.Map<ColorModel>(newColor);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if(id == 0) throw new NotImplementedException();
            var deleteColor = await _context.Colors.FindAsync(id);
            if (deleteColor == null) return false;
            var deleteProductColors = await _context.ProductColors.Where(c => c.ColorId == id).ToListAsync();
            _context.ProductColors.RemoveRange(deleteProductColors);
            _context.Colors.Remove(deleteColor);
            await _context.SaveChangesAsync();
            return true;

        }
        public async Task<List<ColorModel>> GetAllAsync()
        {
            var colors = await _context.Colors.ToListAsync();
            return _mapper.Map<List<ColorModel>>(colors);
        }

        public async Task<ColorModel> GetByIdAsync(int id)
        {
            if (id == 0) throw new NotImplementedException();
            var color = await _context.Colors.FindAsync(id);
            return _mapper.Map<ColorModel>(color);
        }

        public async Task<bool> UpdateAsync(int id, ColorModel model)
        {
            if (id != model.Id) return false;
            var updateColor = _mapper.Map<Color>(model);
            _context.Colors!.Update(updateColor);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
