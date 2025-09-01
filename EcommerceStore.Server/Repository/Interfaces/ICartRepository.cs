using System.Threading.Tasks;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface ICartRepository
    {
        //// Lấy giỏ theo cartKey (guest) hoặc userId (đăng nhập)
        //Task<CartView> GetOrCreateAsync(string? userId, string cartKey);

        //// Thêm item vào giỏ
        //Task<CartView> AddItemAsync(string? userId, string cartKey, int productId, int quantity);

        //// Cập nhật số lượng 1 item
        //Task<CartView> UpdateItemAsync(string? userId, string cartKey, int itemId, int quantity);

        //// Xóa một item
        //Task<CartView> RemoveItemAsync(string? userId, string cartKey, int itemId);

        //// Xóa toàn bộ giỏ
        //Task<bool> ClearAsync(string? userId, string cartKey);

        public Task<CartView> GetAllAsync();
        public Task<CartView> AddItemAsync(AddCart model);
        public Task<CartView> UpdateItemAsync(int productId, int quantity);
        public Task<CartView> RemoveItemAsync(int productId);
    }
}
