using AutoMapper;
using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace DoAnChuyenNganh.Server.Repository.Implementations
{
    public class BrandRepository : IBrandRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;

        public BrandRepository(EcommerceStoreContext context, IMapper mapper) {
            _context = context;
            _mapper = mapper;
        
        }

        public async Task<BrandModel> AddAsync(BrandModel model)
        {
            if (model == null) throw new ArgumentNullException("model");
            var newBrand = _mapper.Map<Brand>(model);
            _context.Brands.Add(newBrand);
            await _context.SaveChangesAsync();
            return _mapper.Map<BrandModel>(newBrand);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var deleteBrand = await _context.Brands.FindAsync(id);
            if (deleteBrand == null) return false;
            _context.Brands.Remove(deleteBrand);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<BrandModel>> GetAllAsync()
        {
            var brands = await _context.Brands.ToListAsync();
            return _mapper.Map<List<BrandModel>>(brands);
        }
        public async Task<BrandModel> GetByIdAsync(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            return _mapper.Map<BrandModel>(brand);
        }

        public async Task<bool> UpdateAsync(int id, BrandModel model)
        {
            if (id != model.Id) return false;
            var updateBrand = _mapper.Map<Brand>(model);
            _context.Brands!.Update(updateBrand);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
