using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class RatingRepository : IRatingRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;

        public RatingRepository(EcommerceStoreContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<RatingProductModel>> GetByProductIdAsync(int productId)
        {
            var ratings = await _context.RatingProducts
                .Include(r => r.User) // ⭐ cần Email
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreateAt)
                .ToListAsync();

            return _mapper.Map<List<RatingProductModel>>(ratings);
        }

        public async Task<RatingProductModel> GetByIdAsync(int id)
        {
            var rating = await _context.RatingProducts
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            return _mapper.Map<RatingProductModel>(rating);
        }

        public async Task<RatingProductModel> AddAsync(RatingProductModel model)
        {
            // map các field cơ bản: ProductId, Rating, Comment, CreateAt
            var entity = _mapper.Map<RatingProduct>(model);
            entity.CreateAt = DateTime.UtcNow;

            if (string.IsNullOrEmpty(model.Email))
                throw new Exception("Token không có email, không thể tạo đánh giá.");

            // ⭐ Attach user theo Email (đi theo policy teammate)
            if (!string.IsNullOrEmpty(model.Email))
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == model.Email);
                if (user == null)
                    throw new Exception("Người dùng không tồn tại.");

                entity.User = user; // EF sẽ dùng FK UserId (shadow hoặc cột có sẵn)
            }

            _context.RatingProducts.Add(entity);
            await _context.SaveChangesAsync();

            // load lại kèm User để trả về Email
            await _context.Entry(entity).Reference(r => r.User).LoadAsync();
            return _mapper.Map<RatingProductModel>(entity);
        }

        public async Task<bool> UpdateAsync(int id, RatingProductModel model)
        {
            if (id != model.Id) return false;

            var entity = await _context.RatingProducts.FindAsync(id);
            if (entity == null) return false;

            // chỉ cho phép sửa nội dung / số sao
            entity.Rating = model.Rating;
            entity.Comment = model.Comment ?? string.Empty;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rating = await _context.RatingProducts.FindAsync(id);
            if (rating == null) return false;

            _context.RatingProducts.Remove(rating);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}