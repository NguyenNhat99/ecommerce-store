// Repository/Implementations/BlogRepository.cs
using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

public class BlogRepository : IBlogRepository
{
    private readonly EcommerceStoreContext _context;
    private readonly IMapper _mapper;
    private readonly IImageRepository _imageRepo; // <-- inject

    public BlogRepository(EcommerceStoreContext context, IMapper mapper, IImageRepository imageRepo)
    {
        _context = context;
        _mapper = mapper;
        _imageRepo = imageRepo;
    }

    public async Task<IEnumerable<BlogPostResponseModel>> GetAllEnableAsync()
        => await GetAllAsync(includeDraft: false);

    public async Task<IEnumerable<BlogPostResponseModel>> GetAllAsync(bool includeDraft)
    {
        var q = _context.BlogPosts.AsQueryable();
        q = q.Where(b => b.IsPublished);
        var list = await q.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return _mapper.Map<IEnumerable<BlogPostResponseModel>>(list);
    }

    public async Task<IEnumerable<BlogPostResponseModel>> GetAllAsync()
    {
        var q = _context.BlogPosts.AsQueryable();
        var list = await q.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return _mapper.Map<IEnumerable<BlogPostResponseModel>>(list);
    }

    public async Task<BlogPostResponseModel?> GetByIdAsync(int id)
    {
        var blog = await _context.BlogPosts.FirstOrDefaultAsync(b => b.Id == id && b.IsPublished);
        return blog == null ? null : _mapper.Map<BlogPostResponseModel>(blog);
    }

    public async Task<BlogPostResponseModel?> GetOneAnyAsync(int id)
    {
        var blog = await _context.BlogPosts.FirstOrDefaultAsync(b => b.Id == id);
        return blog == null ? null : _mapper.Map<BlogPostResponseModel>(blog);
    }

    // ==== CREATE (multipart) ====
    public async Task<BlogPostResponseModel> AddAsync(BlogPostFormModel model, string authorId)
    {
        // Validate unique Slug
        var exists = await _context.BlogPosts.AnyAsync(b => b.Slug == model.Slug);
        if (exists) throw new InvalidOperationException("Slug đã tồn tại.");

        string? newUrl = model.ThumbnailUrl;
        string? newPid = null;

        // Upload file nếu có
        if (model.ThumbnailFile != null)
        {
            (newUrl, newPid) = await _imageRepo.AddAsync(model.ThumbnailFile, folder: "Blogs");
        }

        var blog = new BlogPost
        {
            Title = model.Title,
            Slug = model.Slug,
            Content = model.Content,
            IsPublished = model.IsPublished,
            Thumbnail = newUrl,
            ThumbnailPublicId = newPid,
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BlogPosts.Add(blog);
        await _context.SaveChangesAsync();

        return _mapper.Map<BlogPostResponseModel>(blog);
    }

    // === giữ API cũ JSON (nếu còn dùng) ===
    public async Task<BlogPostResponseModel> AddAsync(BlogPostRequestModel model, string authorId)
    {
        var exists = await _context.BlogPosts.AnyAsync(b => b.Slug == model.Slug);
        if (exists) throw new InvalidOperationException("Slug đã tồn tại.");

        var blog = _mapper.Map<BlogPost>(model);
        blog.AuthorId = authorId;
        _context.BlogPosts.Add(blog);
        await _context.SaveChangesAsync();
        return _mapper.Map<BlogPostResponseModel>(blog);
    }

    // ==== UPDATE (multipart) ====
    public async Task<BlogPostResponseModel?> UpdateAsync(int id, BlogPostFormModel model)
    {
        var blog = await _context.BlogPosts.FirstOrDefaultAsync(b => b.Id == id);
        if (blog == null) return null;

        // check slug unique
        var slugUsed = await _context.BlogPosts.AnyAsync(b => b.Slug == model.Slug && b.Id != id);
        if (slugUsed) throw new InvalidOperationException("Slug đã tồn tại.");

        // Track ảnh cũ để xoá sau commit
        string? oldPid = null;

        // Nếu upload ảnh mới
        if (model.ThumbnailFile != null)
        {
            oldPid = blog.ThumbnailPublicId; // xoá sau commit

            var (newUrl, newPid) = await _imageRepo.AddAsync(model.ThumbnailFile, "Blogs");
            blog.Thumbnail = newUrl;
            blog.ThumbnailPublicId = newPid;
        }
        else if (!string.IsNullOrWhiteSpace(model.ThumbnailUrl))
        {
            // Cho phép update trực tiếp URL (nếu muốn)
            blog.Thumbnail = model.ThumbnailUrl;
        }

        blog.Title = model.Title;
        blog.Slug = model.Slug;
        blog.Content = model.Content;
        blog.IsPublished = model.IsPublished;

        await _context.SaveChangesAsync();

        // Xoá ảnh cũ trên Cloudinary (sau khi DB đã ok)
        if (!string.IsNullOrWhiteSpace(oldPid))
        {
            try { await _imageRepo.DeleteAsync(oldPid); } catch { /* log nếu cần */ }
        }

        return _mapper.Map<BlogPostResponseModel>(blog);
    }

    // === giữ API cũ JSON (nếu còn dùng) ===
    public async Task<BlogPostResponseModel?> UpdateAsync(int id, BlogPostRequestModel model)
    {
        var existing = await _context.BlogPosts.FindAsync(id);
        if (existing == null) return null;

        // check slug unique
        var slugUsed = await _context.BlogPosts.AnyAsync(b => b.Slug == model.Slug && b.Id != id);
        if (slugUsed) throw new InvalidOperationException("Slug đã tồn tại.");

        _mapper.Map(model, existing);
        await _context.SaveChangesAsync();
        return _mapper.Map<BlogPostResponseModel>(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var blog = await _context.BlogPosts.FindAsync(id);
        if (blog == null) return false;

        var pid = blog.ThumbnailPublicId;

        _context.BlogPosts.Remove(blog);
        await _context.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(pid))
        {
            try { await _imageRepo.DeleteAsync(pid); } catch { /* log nếu cần */ }
        }
        return true;
    }
}
