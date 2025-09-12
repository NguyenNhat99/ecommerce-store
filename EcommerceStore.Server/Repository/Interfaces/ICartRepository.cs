using System.Threading.Tasks;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;

namespace EcommerceStore.Server.Repository.Interfaces
{
    public interface ICartRepository
    {
        Task<CartView> GetAllAsync();
        Task<CartView> AddItemAsync(AddCart model);
        Task<CartView> UpdateItemAsync(int productId, int quantity);
        Task<CartView> RemoveItemAsync(int productId);
        Task MergeAnonymousToUserAsync();
        Task<CartView> ClearAsync();
        Task<Cart?> FindOpenCartAsync(string? userId, string? anonId);
    }
}
