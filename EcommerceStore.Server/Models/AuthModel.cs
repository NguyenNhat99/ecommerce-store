using System.ComponentModel.DataAnnotations;

namespace EcommerceStore.Server.Models
{
    public class AccountModel
    {
        public string FirstName { set; get; } = string.Empty;
        public string LastName { set; get; } = string.Empty ;
        public bool Gender { set; get; }
        public string UserName { set; get; } = string.Empty;
        public string Email { set; get; } = string.Empty;
        public string PhoneNumber { set; get; } = string.Empty;
        public string Role { set; get; } = string.Empty;
        public string Address { set; get; } = string.Empty;
        public bool LockoutEnabled { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        public bool IsLocked => LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
    }
    public record LockAccountDto(string Email, DateTimeOffset? Until);
    public record UnlockAccountDto(string Email);
    public record SetLockoutEnabledDto(string Email, bool Enabled);
    public class SignInModel
    {
        [Required]
        [EmailAddress]
        public string Email { set; get; } = null!;
        [Required]
        public string Password { set; get; } = null!;
    }
    public class SignUpModel
    {
        [Required]
        [EmailAddress]
        public string Email { set; get; } = null!;
        [Required]
        public string Password { set; get; } = null!;
        [Required]
        public string FirstName { set; get; } = null!;
        [Required]
        public string LastName { set; get; } = null!;
        [Required]
        public bool Gender { set; get; }
        [Required]
        public string PhoneNumber { set; get; } = null!;
    }
    public class UpdateInformationModel
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        public string LastName { get; set; } = string.Empty;
        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required]
        public bool Gender { get; set; }
        public string Address { get; set; } = string.Empty;
    }
    public class ChangePasswordModel
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
    public class ForgotPasswordModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
    public class ResetPasswordModel
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }

}
