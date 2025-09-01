using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Helpers;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class AccountRepository : IAccountRepository
    {
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly IConfiguration configuration;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IMapper mapper;
        private readonly IEmailSender emailSender;

        public AccountRepository(EcommerceStoreContext context, UserManager<User> userManager, SignInManager<User> signInManager, 
            IConfiguration configuration, RoleManager<IdentityRole> roleManager, IHttpContextAccessor httpContextAccessor,
            IMapper mapper, IEmailSender emailSender) {

            this.userManager = userManager;
            this.signInManager = signInManager;
            this.configuration = configuration;
            this.roleManager = roleManager;
            this.httpContextAccessor = httpContextAccessor;
            this.mapper = mapper;
            this.emailSender = emailSender;
        }
        /// <summary>
        /// Lấy thông tin user hiện tại
        /// Kiểm tra người dùng đã đăng nhập chưa
        /// </summary>
        /// <returns>
        /// Nếu có người dùng sẽ trả về một AccountModel
        /// Nếu không có hoặc chưa đăng nhập sẽ trả về Null
        /// </returns>
        public async Task<AccountModel> GetCurrentUser()
        {
            var userClaim = httpContextAccessor.HttpContext?.User;

            if (userClaim?.Identity?.IsAuthenticated != true) return null; // chưa đăng nhập

            var email = userClaim.Claims.FirstOrDefault(e => e.Type == ClaimTypes.Email)?.Value; // lấy email từ
            if (String.IsNullOrEmpty(email)) return null;

            var user = await userManager.FindByEmailAsync(email);
            if (user == null) return null;

            var accoutModel = mapper.Map<AccountModel>(user);
            accoutModel.Role = (await userManager.GetRolesAsync(user)).First();

            return accoutModel;
        }

        /// <summary>
        /// Đăng nhập tài khoản
        /// Xác thực thông tin người dùng với thông tin đăng nhập và tạo jwt token nếu hợp lệ
        /// </summary>
        /// <param name="model">Đối tượng SignInModel chứa tài khoản và mật khẩu</param>
        /// <returns>
        /// Trả về jwt token nếu đăng nhập thành công
        /// Trả về chuỗi rỗng nếu thất bại
        /// </returns>
        public async Task<string> SignInAsync(SignInModel model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            var passwordValid = await userManager.CheckPasswordAsync(user, model.Password);
            if (user == null || !passwordValid)
            {
                return string.Empty;
            }
            var authClaim = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),         
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),      
                new Claim(ClaimTypes.Email, user.Email ?? model.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var userRoles = await userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaim.Add(new Claim(ClaimTypes.Role, role.ToString()));
            }
            var authenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]));

            var token = new JwtSecurityToken(
                issuer: configuration["JWT:ValidIssuer"],
                audience: configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddMinutes(20),
                claims: authClaim,
                signingCredentials: new SigningCredentials(authenKey, SecurityAlgorithms.HmacSha512Signature)
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Đăng ký tài khoản
        /// Mặc định role khi đăng ký là staff 
        /// </summary>
        /// <param name="model">Đối tượng SignUpModel chứa thông tin đăng ký tài khoản</param>
        /// <returns>
        /// Đối tượng IdentityResult
        /// </returns>
        public async Task<IdentityResult> SignUpAsync(SignUpModel model)
        {
            var user = new User
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                Gender = model.Gender,
                PhoneNumber = model.PhoneNumber,
                UserName = model.Email,
                Address = ""
            };
            var result = await userManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                //if (!await roleManager.RoleExistsAsync(UserRole.Customer))
                //{
                //    await roleManager.CreateAsync(new IdentityRole(UserRole.Customer));
                //}
                await userManager.AddToRoleAsync(user, UserRole.Customer);
            }
            return result;
        }
        /// <summary>
        /// Cập nhật mật khẩu mới cho tài khoản
        /// </summary>
        /// <param name="model">Đối tượng ChangePasswordModel chứa thông tin mật khẩu hiện tại và mật khẩu mới</param>
        /// <returns>
        /// True nếu đổi mật khẩu thành công
        /// False nếu đổi mật khẩu thất bại
        /// </returns>
        public async Task<bool> UpdatePasswordAsync(ChangePasswordModel model)
        {
            if (model.CurrentPassword.Length < 1 || model.NewPassword.Length < 1) return false;

            var userModel = await GetCurrentUser();
            if (userModel == null) return false;

            var user = await userManager.FindByEmailAsync(userModel.Email);
            if (user == null) return false;

            var passwordValid = await userManager.CheckPasswordAsync(user, model.CurrentPassword);
            if (!passwordValid) return false;

            var changePassword = await userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!changePassword.Succeeded) return false;
            return true;
        }
        /// <summary>
        /// Thay đổi thông tin tài khoản
        /// </summary>
        /// <param name="model">Đối tượng AccountModel chứa các thông tin cần đổi được gửi về</param>
        /// <returns>
        /// 
        /// </returns>
        public async Task<bool> UpdateInformationAsync(UpdateInformationModel model)
        {
            var userModel = await GetCurrentUser();
            if (userModel == null) return false;

            var user = await userManager.FindByEmailAsync(userModel.Email);
            if (user == null) return false;

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.PhoneNumber = model.PhoneNumber;
            user.Gender = model.Gender;
            user.Address = model.Address;

            var result = await userManager.UpdateAsync(user);
            return result.Succeeded;
        }
        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await userManager.FindByEmailAsync(email);
            //var check = await userManager.IsEmailConfirmedAsync(user);
            //if (user == null || !(await userManager.IsEmailConfirmedAsync(user)))
            //    return true;
            if (user == null) return false;

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = System.Web.HttpUtility.UrlEncode(token);
            var resetLink = $"https://localhost:5173/reset-password?email={email}&token={encodedToken}";

            await emailSender.SendEmailAsync(email, "Reset Password",
                $"<p>Click the link below to reset your password:</p><a href='{resetLink}'>Reset Password</a>");

            return true;
        }
        public async Task<bool> ResetPasswordAsync(ResetPasswordModel model)
        {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user == null) return false;

            //nếu cần test trong swagger thì tắ cm decodedToken
            //var decodedToken = HttpUtility.UrlDecode(model.Token);
            //var result = await userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

            var result = await userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            return result.Succeeded;
        }
        /// <summary>
        /// Lấy danh sách tài khoản (ngoại trừ role Admin)
        /// </summary>
        public async Task<List<AccountModel>> GetAllAsync()
        {
            var users = userManager.Users.ToList();
            var result = new List<AccountModel>();

            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                if (!roles.Contains(UserRole.Admin))
                {
                    var model = mapper.Map<AccountModel>(user);
                    model.Role = roles.FirstOrDefault() ?? "";
                    result.Add(model);
                }
            }
            return result;
        }
        /// <summary>
        /// Lấy thông tin tài khoản theo Email (không trả về Admin)
        /// </summary>
        public async Task<AccountModel?> GetById(string email)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null) return null;

            var roles = await userManager.GetRolesAsync(user);
            if (roles.Contains(UserRole.Admin))
                return null; 

            var model = mapper.Map<AccountModel>(user);
            model.Role = roles.FirstOrDefault() ?? "";
            return model;
        }


    }
}
