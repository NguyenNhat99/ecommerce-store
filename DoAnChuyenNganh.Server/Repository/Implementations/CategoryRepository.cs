using AutoMapper;
using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DoAnChuyenNganh.Server.Repository.Implementations
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;
        public CategoryRepository(EcommerceStoreContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }   
        public async Task<CategoryModel> AddAsync(CategoryModel model)
        {
            if (model == null) throw new ArgumentNullException("model");
            var newCategory = _mapper.Map<Category>(model);
            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();
            return _mapper.Map<CategoryModel>(newCategory);
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var deleteCategory = await _context.Categories.FindAsync(id);
            if (deleteCategory == null) return false;
            _context.Categories.Remove(deleteCategory);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<List<CategoryModel>> GetAllAsync()
        {
            var categories = await _context.Categories.ToListAsync();
            return _mapper.Map<List<CategoryModel>>(categories);
        }
        public async Task<CategoryModel> GetByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            return _mapper.Map<CategoryModel>(category);
        }

        public async Task<bool> UpdateAsync(int id, CategoryModel model)
        {
            if (id != model.Id) return false;
            var updateCategory = _mapper.Map<Category>(model);
            _context.Categories!.Update(updateCategory);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
