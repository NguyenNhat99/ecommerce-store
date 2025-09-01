using EcommerceStore.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface IAccountRepository
    {
        public Task<IdentityResult> SignUpAsync(SignUpModel model);
        public Task<string> SignInAsync(SignInModel model);
        public Task<AccountModel> GetCurrentUser();
        public Task<bool> UpdatePasswordAsync(ChangePasswordModel model);
        public Task<bool> UpdateInformationAsync(UpdateInformationModel model);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordModel model);
        Task<List<AccountModel>> GetAllAsync();
        Task<AccountModel?> GetById(string email);
    }
}
