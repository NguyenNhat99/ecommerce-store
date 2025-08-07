using DoAnChuyenNganh.Server.Models;
using DoAnChuyenNganh.Server.Repository.Implementations;
using DoAnChuyenNganh.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoAnChuyenNganh.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;

        public AccountsController(IAccountRepository accountRepository) {
            _accountRepository = accountRepository;
        }
        /// <summary>
        /// API Đăng ký tài khoản
        /// </summary>
        /// <param name="model">Đối tượng SignUpModel chứa thông tin đăng ký người dùng</param>
        /// <returns>
        /// http 400 BadRequest: Khi đăng ký thất bại
        /// http 201 CreatedAtAction: Khi đăng ký tài khoản thành công
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpPost("auth/singup")]
        public async Task<IActionResult> SignUp(SignUpModel model)
        {
            try
            {
                var result = await _accountRepository.SignUpAsync(model);
                if (!result.Succeeded)
                {
                    return BadRequest(new { message = "Đăng ký tài khoản thất bại" });
                }
                return StatusCode(201, new { message = "Đăng ký tài khoản thành công" });
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }

        }
        /// <summary>
        /// API đăng nhập tài khoản 
        /// </summary>
        /// <param name="model">Đối tượng SignInModel chứa thông tin đăng nhập</param>
        /// <returns>
        /// Http 401 Unauthorized: nếu thông tin đăng nhập không hợp lệ
        /// Http 200 Ok: kèm theo jwt token nếu đăng nhập thành công
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpPost("auth/signin")]
        public async Task<IActionResult> SignIn(SignInModel model)
        {
            try
            {
                var result = await _accountRepository.SignInAsync(model);
                if (string.IsNullOrEmpty(result))
                {
                    return Unauthorized();
                }
                return Ok(result);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });

            }
        }
        /// <summary>
        /// API Lấy thông tin người dùng hiện tại
        /// </summary>
        /// <returns>
        /// Http 404 NotFound: Nếu không tìm thấy tài khoản
        /// Http 200 Ok: Tìm thấy tài khoản
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpGet("auth/GetUser")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var accountModel = await _accountRepository.GetCurrentUser();
                if (accountModel == null) return NotFound();
                return Ok(accountModel);
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API thay đổi mật khẩu tài khoản
        /// </summary>
        /// <param name="model">Chứa thông tin đổi mật khẩu</param>
        /// <returns>
        /// Http 404 NotFound: Khi model null
        /// Http 400 BadRequest: nếu đổi mật khẩu thất bại
        /// Http 200 Ok: nếu đổi mật khẩu thành công
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpPost("auth/changepassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordModel model)
        {
            try
            {
                if(model == null) return NotFound(new {message="Không thấy thông tin cần đổi"});
                var change = await _accountRepository.UpdatePasswordAsync(model);
                if(!change) return BadRequest(new {message="Đổi mật khẩu thất bại"});
                return Ok(new {message="Đổi mật khẩu thành công"});
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        /// <summary>
        /// API thay đổi thông tin tài khoản cá nhân
        /// </summary>
        /// <param name="model">Thông tin cần thay đổi</param>
        /// <returns>
        /// Http 404 NotFound: model null
        /// Http 200 Ok: Đổi thông tin thành công
        /// Http 400 BadRequest: nếu thay đổi thông tin thất bại
        /// http 500: xảy ra lỗi server hoặc không xác định
        /// </returns>
        [HttpPost("auth/changeinformation")]
        [Authorize]
        public async Task<IActionResult> ChangeInformation(UpdateInformationModel model)
        {
            try
            {
                if (model == null) return NotFound(new { message = "Không thấy thông tin cần đổi" });
                var changeStatus = await _accountRepository.UpdateInformationAsync(model);
                if (changeStatus) return Ok("Đổi thông tin thành công");
                return BadRequest("Đổi thông tin thất bại");
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }
        [HttpPost("auth/forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                bool check = await _accountRepository.ForgotPasswordAsync(model.Email);
                if (!check) return BadRequest(new { message = "Thất bại !"});
                return Ok(new {message="Vui lòng kiểm tra Email của bạn !"});
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });
            }
        }

        [HttpPost("auth/reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var result = await _accountRepository.ResetPasswordAsync(model);
                if (!result) return BadRequest("Reset failed");
                return Ok(new {message="Đổi mật khẩu thành công"});
            }
            catch
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi. Vui lòng thử lại sau !" });

            }
        }


    }
}
