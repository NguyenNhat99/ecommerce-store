// Controllers/BlogsController.cs
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private readonly IBlogRepository _blogRepository;
    public BlogsController(IBlogRepository blogRepository) => _blogRepository = blogRepository;

    [HttpGet("enable")]
    public async Task<IActionResult> GetAllEnable([FromQuery] bool includeDraft = false)
    {
        // (tuỳ: check role cho includeDraft)
        var blogs = await _blogRepository.GetAllAsync(true);
        return Ok(blogs);
    }

    [HttpGet()]
    public async Task<IActionResult> GetAll()
    {
        // (tuỳ: check role cho includeDraft)
        var blogs = await _blogRepository.GetAllAsync();
        return Ok(blogs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var blog = await _blogRepository.GetByIdAsync(id);
        return blog == null ? NotFound() : Ok(blog);
    }

    // ============ CREATE: multipart/form-data ============
    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] BlogPostFormModel model)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var blog = await _blogRepository.AddAsync(model, authorId);
            return CreatedAtAction(nameof(GetById), new { id = blog.Id }, blog);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // ============ UPDATE: multipart/form-data ============
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(int id, [FromForm] BlogPostFormModel model)
    {
        try
        {
            var updated = await _blogRepository.UpdateAsync(id, model);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _blogRepository.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
