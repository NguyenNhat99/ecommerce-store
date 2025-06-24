using Microsoft.AspNetCore.Identity;

namespace DoAnChuyenNganh.Server.Data
{
    public class User : IdentityUser
    {
        public string FirstName { set; get; } = null!;
        public string LastName { set; get; } = null!;
        public bool Gender { set; get; }
        public string Address { set; get; } = string.Empty;
    }
}
