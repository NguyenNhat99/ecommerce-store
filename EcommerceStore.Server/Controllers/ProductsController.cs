using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Implementations;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceStore.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _productRepository;

        public ProductsController(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }
        [HttpGet]
        public async Task<ActionResult<List<ProductResponseModel>>> GetAll()
        {
            try
            {
                var products = await _productRepository.GetAllAsync();
                if (!products.Any()) return NotFound(new { message = "Không tìm thấy thương hiệu nào" });
                return Ok(products);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponseModel>> GetById(int id)
        {
            try
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product == null) return NotFound(new { message = "không tìm thấy sản phẩm" });
                return Ok(product);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> Delete(int id)
        {
            try
            {
                var deleteProduct = await _productRepository.DeleteAsync(id);
                if (!deleteProduct) return BadRequest(new { message = "Xóa thất bại" });
                return NoContent();
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API tạo mới sản phẩm (kèm ảnh, size, màu)
        /// </summary>
        /// <param name="model">ProductRequestModel</param>
        /// <returns>ProductResponseModel</returns>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddProduct([FromForm] ProductRequestModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _productRepository.AddAsync(model);
                return Ok(result);
            }
            catch
            {
                return BadRequest(ModelState);
            }
        }
        /// <summary>
        /// API cập nhật sản phẩm (kèm ảnh, size, màu)
        /// </summary>
        /// <param name="id">Id sản phẩm cần cập nhật</param>
        /// <param name="model">ProductRequestModel</param>
        /// <returns>Trạng thái cập nhật</returns>
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductRequestModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _productRepository.UpdateAsync(id, model);
                if (!success)
                    return NotFound(new { message = "Không tìm thấy sản phẩm để cập nhật." });

                return Ok(new { message = "Cập nhật sản phẩm thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau!", error = ex.Message });
            }
        }

    }
}
