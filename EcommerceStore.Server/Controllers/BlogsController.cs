using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcommerceStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : ControllerBase
    {
        private readonly IBlogRepository _blogRepository;

        public BlogsController(IBlogRepository blogRepository)
        {
            _blogRepository = blogRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var blogs = await _blogRepository.GetAllAsync();
            return Ok(blogs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var blog = await _blogRepository.GetByIdAsync(id);
            if (blog == null) return NotFound();
            return Ok(blog);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Create([FromBody] BlogPostRequestModel model)
        {
            var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var blog = await _blogRepository.AddAsync(model, authorId);
            return Ok(blog);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Update(int id, [FromBody] BlogPostRequestModel model)
        {
            var updated = await _blogRepository.UpdateAsync(id, model);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _blogRepository.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
