using DoAnChuyenNganh.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace DoAnChuyenNganh.Server.Repository.Interfaces
{
    public interface IAccountRepository
    {
        public Task<IdentityResult> SignUpAsync(SignUpModel model);
        public Task<string> SignInAsync(SignInModel model);
        public Task<AccountModel> GetCurrentUser();
        public Task<bool> UpdatePasswordAsync(ChangePasswordModel model);
        public Task<bool> UpdateInformationAsync(UpdateInformationModel model);
    }
}
