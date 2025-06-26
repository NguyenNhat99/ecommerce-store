using DoAnChuyenNganh.Server.Data;
using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DoAnChuyenNganh.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly IBrandRepository _brandRepository;

        public BrandsController(IBrandRepository brandRepository) {
            _brandRepository = brandRepository;
        }
        /// <summary>
        /// API Lấy danh sách thương hiệu
        /// </summary>
        /// <returns>
        /// http 404 NotFound: Khi không tìm thấy sản phẩm
        /// http 200 Ok: kèm danh sách thương hiệu nếu tìm thấy
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpGet]
        public async Task<ActionResult<List<BrandModel>>> GetAll()
        {
            try
            {
                var brands = await _brandRepository.GetAllAsync();
                if (!brands.Any()) return NotFound(new { message = "Không tìm thấy thương hiệu nào" });
                return Ok(brands);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Lấy thương hiệu theo mã
        /// </summary>
        /// <param name="id">Mã thương hiệu cần tìm</param>
        /// <returns>
        /// http 404 NotFound: Khi không tìm thấy sản phẩm
        /// http 200 Ok: kèm thương hiệu nếu tìm thấy
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<BrandModel>> GetById(int id)
        {
            try
            {
                var brand = await _brandRepository.GetByIdAsync(id);
                if (brand == null) return NotFound(new { message = "không tìm thấy thương hiệu" });
                return Ok(brand);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Thêm thương hiệu
        /// </summary>
        /// <param name="model">thông tin thương hiệu cần thêm</param>
        /// <returns>
        /// http 400 BadRequest: Thêm thất bại
        /// http 404 NotFound: Sau khi thêm xong nhưng không tìm thấy trong database
        /// http 201 CreateAtAction: Thêm thành công kèm thêm URL vừa truy xuất và thương hiệu vừa tạo
        /// http 500: Nếu xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpPost]
        public async Task<ActionResult<BrandModel>> Create(BrandModel model)
        {
            try
            {
                var newBrand = await _brandRepository.AddAsync(model);
                if (newBrand == null) return BadRequest(new { message = "Thêm thất bại" });

                var brand = await _brandRepository.GetByIdAsync(newBrand.Id);
                if (brand == null) return NotFound(new {message="Không tìm thấy thương hiệu"});

                return CreatedAtAction(nameof(GetById), new { id = newBrand.Id }, brand);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Xóa thương hiệu
        /// </summary>
        /// <param name="id">Mã thương hiệu cần xóa</param>
        /// <returns>
        /// http 404 BadRequest: Xóa không thành công
        /// http 204 NoContent: Xóa thành công
        /// http 500: Xảy ra lỗi ở server hoặc bất kỳ
        /// </returns>
        [HttpDelete]
        public async Task<ActionResult<bool>> Delete(int id)
        {
            try
            {
                var deleteBrand = await _brandRepository.DeleteAsync(id);
                if (!deleteBrand) return BadRequest(new { message = "Xóa thất bại" });
                return NoContent();
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Cập nhật thương hiệu
        /// </summary>
        /// <param name="id">Mã thương hiệu cần cập nhật</param>
        /// <param name="model">Thông tin cập nhật</param>
        /// <returns>
        /// Http 400 BadRequest: Cập nhật thất bại
        /// Http 200 Ok: Cập nhật thành công
        /// Http 500: Lỗi server hoặc không xác định
        /// </returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> Update(int id, BrandModel model)
        {
            try
            {
                var updateBrand = await _brandRepository.UpdateAsync(id, model);
                if (!updateBrand) return BadRequest(new {message="Cập nhật thất bại"});
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }


    }
}
