using System.Security.Claims;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ControllerBase
    {
        private readonly IRatingRepository _repo;

        public RatingsController(IRatingRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<List<RatingProductModel>>> GetByProductId(int productId)
        {
            var ratings = await _repo.GetByProductIdAsync(productId);
            return Ok(ratings);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<RatingProductModel>> Add([FromBody] RatingProductModel model)
        {
            var claims = User.Claims.Select(c => $"{c.Type} = {c.Value}");
            Console.WriteLine("User claims: " + string.Join(", ", claims));

            // teammate chỉ expose Email
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
                return Unauthorized(new { message = "Bạn cần đăng nhập." });

            // gắn email vào model để repo attach User
            model.Email = email;

            var newRating = await _repo.AddAsync(model);
            return Ok(newRating);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] RatingProductModel model)
        {
            var ok = await _repo.UpdateAsync(id, model);
            if (!ok) return BadRequest();
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _repo.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}