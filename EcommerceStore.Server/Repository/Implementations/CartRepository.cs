using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Scaffolding;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class CartRepository : ICartRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IHttpContextAccessor _http;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public CartRepository(
            EcommerceStoreContext context,
            IHttpContextAccessor httpContextAccessor,
            UserManager<User> userManager, IMapper mapper)
        {
            _context = context;
            _http = httpContextAccessor;
            _userManager = userManager;
            _mapper = mapper;
        }
        private string? CurrentUserId
        {
            get
            {
                var principal = _http.HttpContext?.User;
                if (principal?.Identity?.IsAuthenticated != true) return null;
                return _userManager.GetUserId(principal);
            }
        }
        // CartRepository.cs
        public async Task<CartView> AddItemAsync(AddCart model) // đổi trả về CartView để FE setCart ngay
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(CurrentUserId))
                throw new UnauthorizedAccessException("Bạn cần đăng nhập.");

            var product = await _context.Products.FindAsync(model.ProductId)
                          ?? throw new ArgumentException("Sản phẩm không tồn tại.");

            // Lấy hoặc tạo giỏ mở của user
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == CurrentUserId && c.Status == false);

            if (cart == null)
            {
                cart = new Cart
                {
                    CreatedAt = DateTime.UtcNow,
                    UserId = CurrentUserId,
                    Status = false
                };
                await _context.Carts.AddAsync(cart);
                await _context.SaveChangesAsync(); // để có cart.Id
                                                   // refresh include Items
                _context.Entry(cart).Collection(c => c.Items).Load();
            }

            // Tìm item trùng product
            var existItem = cart.Items.FirstOrDefault(i => i.ProductId == model.ProductId);

            if (existItem != null)
            {
                // cộng dồn
                var addQty = Math.Max(1, model.Quantity);
                existItem.Quantity += addQty;
                _context.CartItems.Update(existItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = model.ProductId,
                    Quantity = Math.Max(1, model.Quantity),
                    UnitPrice = product.Price, // giữ đơn giá tại thời điểm thêm
                };
                await _context.CartItems.AddAsync(newItem);
            }

            await _context.SaveChangesAsync();

            // trả lại giỏ đã cập nhật
            var refreshed = await _context.Carts
                .AsNoTracking()
                .Include(c => c.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == cart.Id);

            return _mapper.Map<CartView>(refreshed);
        }


        public async Task<CartView> GetAllAsync()
        {
            var cart = await _context.Carts.AsNoTracking().Include(c => c.Items).ThenInclude(i => i.Product).OrderByDescending(c => c.CreatedAt).FirstOrDefaultAsync();
            return _mapper.Map<CartView>(cart);
        }

        public async Task<CartView> RemoveItemAsync(int productId)
        {
            // Bắt buộc đã đăng nhập
            if (string.IsNullOrEmpty(CurrentUserId))
                throw new UnauthorizedAccessException("Bạn cần đăng nhập để thao tác giỏ hàng.");

            // Tìm item thuộc giỏ mở (Status=false) của user hiện tại
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Where(ci => ci.ProductId == productId
                          && ci.Cart.UserId == CurrentUserId
                          && ci.Cart.Status == false)
                .FirstOrDefaultAsync();

            if (cartItem == null)
                throw new KeyNotFoundException("Không tìm thấy sản phẩm trong giỏ.");

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            // Lấy lại giỏ đã cập nhật để map ra view
            var cart = await _context.Carts
                .AsNoTracking()
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .Where(c => c.Id == cartItem.CartId)
                .FirstOrDefaultAsync();

            return _mapper.Map<CartView>(cart);
        }

        public async Task<CartView> UpdateItemAsync(int productId, int quantity)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                throw new UnauthorizedAccessException("Bạn cần đăng nhập để thao tác giỏ hàng.");

            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Where(ci => ci.ProductId == productId
                          && ci.Cart.UserId == CurrentUserId
                          && ci.Cart.Status == false)
                .FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException("Không tìm thấy sản phẩm trong giỏ.");

            if (quantity < 0) // chỉ xóa khi < 0, còn =0 thì set 0 (nếu bạn muốn vẫn xóa khi =0, giữ nguyên)
            {
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity = quantity;
                _context.CartItems.Update(cartItem);
            }

            await _context.SaveChangesAsync();

            var cart = await _context.Carts
                .AsNoTracking()
                .Include(c => c.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == cartItem.CartId);

            return _mapper.Map<CartView>(cart);
        }

    }
}
