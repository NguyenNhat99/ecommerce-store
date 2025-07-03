using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Implementations;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DoAnChuyenNganh.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }
        /// <summary>
        /// API Lấy danh sách thể loại
        /// </summary>
        /// <returns>
        /// http 404 NotFound: Khi không tìm thấy
        /// http 200 Ok: kèm danh sách thể loại nếu tìm thấy
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpGet]
        public async Task<ActionResult<List<CategoryModel>>> GetAll()
        {
            try
            {
                var categories = await _categoryRepository.GetAllAsync();
                if (!categories.Any()) return NotFound(new { message = "Không tìm thấy thể loại nào" });
                return Ok(categories);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Lấy thể loại theo mã
        /// </summary>
        /// <param name="id">Mã thể loại cần tìm</param>
        /// <returns>
        /// http 404 NotFound: Khi không tìm thấy thể loại
        /// http 200 Ok: kèm thể loại nếu tìm thấy
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryModel>> GetById(int id)
        {
            try
            {
                var category = await _categoryRepository.GetByIdAsync(id);
                if (category == null) return NotFound(new { message = "không tìm thấy thể loại" });
                return Ok(category);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Thêm thể loại
        /// </summary>
        /// <param name="model">thông tin thể loại cần thêm</param>
        /// <returns>
        /// http 400 BadRequest: Thêm thất bại
        /// http 404 NotFound: Sau khi thêm xong nhưng không tìm thấy trong database
        /// http 201 CreateAtAction: Thêm thành công kèm thêm URL vừa truy xuất và thể loại vừa tạo
        /// http 500: Nếu xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpPost]
        public async Task<ActionResult<CategoryModel>> Create(CategoryModel model)
        {
            try
            {
                var newCategory = await _categoryRepository.AddAsync(model);
                if (newCategory == null) return BadRequest(new { message = "Thêm thất bại" });

                var category = await _categoryRepository.GetByIdAsync(newCategory.Id);
                if (category == null) return NotFound(new { message = "Không tìm thấy thể loại" });

                return CreatedAtAction(nameof(GetById), new { id = newCategory.Id }, category);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Xóa thể loại
        /// </summary>
        /// <param name="id">Mã thể loại cần xóa</param>
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
                var deleteCategory = await _categoryRepository.DeleteAsync(id);
                if (!deleteCategory) return BadRequest(new { message = "Xóa thất bại" });
                return NoContent();
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API Cập nhật thể loại
        /// </summary>
        /// <param name="id">Mã thể loại cần cập nhật</param>
        /// <param name="model">Thông tin cập nhật</param>
        /// <returns>
        /// Http 400 BadRequest: Cập nhật thất bại
        /// Http 200 Ok: Cập nhật thành công
        /// Http 500: Lỗi server hoặc không xác định
        /// </returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> Update(int id, CategoryModel model)
        {
            try
            {
                var updateCategory = await _categoryRepository.UpdateAsync(id, model);
                if (!updateCategory) return BadRequest(new { message = "Cập nhật thất bại" });
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
    }
}
