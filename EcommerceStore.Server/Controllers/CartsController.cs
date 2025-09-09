using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EcommerceStore.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartsController : ControllerBase
    {
        private readonly ICartRepository _cartRepo;
        public CartsController(ICartRepository cartRepo)
        {
            _cartRepo = cartRepo;
        }

        /// <summary>GET giỏ hiện tại (user hoặc anonymous). Không tạo mới nếu chưa có.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(CartView), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var cart = await _cartRepo.GetAllAsync(); // có thể null → mapper trả view rỗng
                return Ok(cart);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>Thêm sản phẩm vào giỏ (cộng dồn nếu đã có).</summary>
        [HttpPost("items")]
        [ProducesResponseType(typeof(CartView), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> AddItem([FromBody] AddCart model)
        {
            try
            {
                if (model == null) return BadRequest(new { message = "Dữ liệu không hợp lệ." });
                if (model.ProductId <= 0) return BadRequest(new { message = "productId không hợp lệ." });
                if (model.Quantity <= 0) model.Quantity = 1; // chuẩn hóa

                var cart = await _cartRepo.AddItemAsync(model);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>Cập nhật số lượng theo productId (<=0 thì xóa).</summary>
        [HttpPut("items/{productId:int}")]
        [ProducesResponseType(typeof(CartView), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UpdateItem(int productId, [FromBody] UpdateCartItem dto)
        {
            try
            {
                if (productId <= 0) return BadRequest(new { message = "productId không hợp lệ." });
                if (dto == null) return BadRequest(new { message = "Dữ liệu không hợp lệ." });

                // quantity âm/null coi như 0 => xóa
                var qty = dto.Quantity;
                if (qty < 0) qty = 0;

                var cart = await _cartRepo.UpdateItemAsync(productId, qty);
                return Ok(cart);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>Xóa 1 sản phẩm theo productId.</summary>
        [HttpDelete("items/{productId:int}")]
        [ProducesResponseType(typeof(CartView), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> RemoveItem(int productId)
        {
            try
            {
                if (productId <= 0) return BadRequest(new { message = "productId không hợp lệ." });

                var cart = await _cartRepo.RemoveItemAsync(productId);
                return Ok(cart);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>Gộp giỏ ẩn danh (cookie) vào giỏ user sau khi đăng nhập.</summary>
        [HttpPost("merge")]
        [ProducesResponseType(typeof(CartView), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Merge()
        {
            try
            {
                await _cartRepo.MergeAnonymousToUserAsync();
                var cart = await _cartRepo.GetAllAsync();
                return Ok(cart);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }

        /// <summary>Xóa toàn bộ giỏ (đúng chủ), trả về CartView rỗng.</summary>
        [HttpDelete]
        [ProducesResponseType(typeof(CartView), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Clear()
        {
            try
            {
                var cart = await _cartRepo.ClearAsync(); // → trả CartView sau khi xóa
                return Ok(cart);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!" });
            }
        }
    }
}
