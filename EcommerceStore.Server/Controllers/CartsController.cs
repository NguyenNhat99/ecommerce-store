using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using EcommerceStore.Server.Models;

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

        // Lấy giỏ hiện tại
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var cart = await _cartRepo.GetAllAsync();
                return Ok(cart);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }

        // Thêm sản phẩm vào giỏ
        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddCart model)
        {
            try
            {
                var cart = await _cartRepo.AddItemAsync(model);
                return Ok(cart);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        // Cập nhật số lượng sản phẩm
        [HttpPut("items/{productId}")]
        public async Task<IActionResult> UpdateItem(int productId, [FromBody] UpdateCartItem dto)
        {
            try
            {
                var cart = await _cartRepo.UpdateItemAsync(productId,dto.Quantity);
                return Ok(cart);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }

        // Xóa 1 item
        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveItem(int productId)
        {
            try
            {
                var cart = await _cartRepo.RemoveItemAsync(productId);
                return Ok(cart);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }

        //// Xóa toàn bộ giỏ
        //[HttpDelete]
        //public async Task<IActionResult> Clear()
        //{
        //    try
        //    {
        //        var userId = GetUserIdOrNull();
        //        var cartKey = GetOrSetCartKey();

        //        var ok = await _cartRepo.ClearAsync(userId, cartKey);
        //        if (!ok) return BadRequest(new { message = "Xóa thất bại" });
        //        return NoContent();
        //    }
        //    catch
        //    {
        //        return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
        //    }
        //}
    }
}
