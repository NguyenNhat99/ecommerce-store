using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class BlogRepository : IBlogRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IMapper _mapper;

        public BlogRepository(EcommerceStoreContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BlogPostResponseModel>> GetAllAsync()
        {
            var blogs = await _context.BlogPosts
                .Where(b => b.IsPublished)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BlogPostResponseModel>>(blogs);
        }

        public async Task<BlogPostResponseModel?> GetByIdAsync(int id)
        {
            var blog = await _context.BlogPosts
                .FirstOrDefaultAsync(b => b.Id == id && b.IsPublished);

            return blog == null ? null : _mapper.Map<BlogPostResponseModel>(blog);
        }

        public async Task<BlogPostResponseModel> AddAsync(BlogPostRequestModel model, string authorId)
        {
            var blog = _mapper.Map<BlogPost>(model);
            blog.AuthorId = authorId;

            _context.BlogPosts.Add(blog);
            await _context.SaveChangesAsync();

            return _mapper.Map<BlogPostResponseModel>(blog);
        }

        public async Task<BlogPostResponseModel?> UpdateAsync(int id, BlogPostRequestModel model)
        {
            var existing = await _context.BlogPosts.FindAsync(id);
            if (existing == null) return null;

            _mapper.Map(model, existing);
            await _context.SaveChangesAsync();

            return _mapper.Map<BlogPostResponseModel>(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var blog = await _context.BlogPosts.FindAsync(id);
            if (blog == null) return false;

            _context.BlogPosts.Remove(blog);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
