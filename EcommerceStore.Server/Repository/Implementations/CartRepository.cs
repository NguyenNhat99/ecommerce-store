using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class CartRepository : ICartRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IHttpContextAccessor _http;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        private const string CART_COOKIE = "cart_id";

        public CartRepository(EcommerceStoreContext context,IHttpContextAccessor httpContextAccessor,UserManager<User> userManager,IMapper mapper)
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

        private string? AnonymousId => _http.HttpContext?.Request?.Cookies?[CART_COOKIE];

        /// <summary>
        /// Tìm giỏ đang mở của chính chủ (KHÔNG tạo mới). 
        /// - Nếu đã đăng nhập: theo UserId.
        /// - Nếu chưa đăng nhập nhưng có cookie: theo AnonymousId.
        /// - Nếu không có cả 2: trả null (tuyệt đối không vớ giỏ của người khác).
        /// </summary>
        public async Task<Cart?> FindOpenCartAsync(string? userId, string? anonId)
        {
            if (!string.IsNullOrEmpty(userId))
            {
                return await _context.Carts
                    .Include(c => c.Items).ThenInclude(i => i.Product)
                    .Where(c => !c.Status && c.UserId == userId)
                    .OrderByDescending(c => c.CreatedAt)
                    .FirstOrDefaultAsync();
            }

            if (!string.IsNullOrEmpty(anonId))
            {
                return await _context.Carts
                    .Include(c => c.Items).ThenInclude(i => i.Product)
                    .Where(c => !c.Status && c.AnonymousId == anonId)
                    .OrderByDescending(c => c.CreatedAt)
                    .FirstOrDefaultAsync();
            }

            return null;
        }

        /// <summary>
        /// Lấy giỏ đang mở của chính chủ; nếu chưa có thì tạo mới.
        /// - Anonymous: nếu thiếu cookie thì phát sinh và set trước khi tạo giỏ.
        /// </summary>
        private async Task<Cart> GetOrCreateOpenCartAsync()
        {
            var userId = CurrentUserId;
            var anonId = AnonymousId;

            var existing = await FindOpenCartAsync(userId, anonId);
            if (existing != null) return existing;

            if (userId == null && string.IsNullOrEmpty(anonId))
            {
                // Tạo cookie cart_id cho anonymous nếu thiếu
                anonId = Guid.NewGuid().ToString("N");
                _http.HttpContext?.Response?.Cookies?.Append(
                    CART_COOKIE,
                    anonId,
                    new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true, // true nếu chạy HTTPS
                        SameSite = SameSiteMode.Lax,
                        Expires = DateTimeOffset.UtcNow.AddDays(30)
                    });
            }

            var cart = new Cart
            {
                CreatedAt = DateTime.UtcNow,
                Status = false,
                UserId = userId,
                AnonymousId = userId == null ? anonId : null
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            // Đảm bảo Items sẵn sàng sử dụng
            await _context.Entry(cart).Collection(c => c.Items).LoadAsync();

            return cart;
        }

        /// <summary>
        /// GET giỏ hàng hiện tại (không tạo mới). Nếu không có → trả null (FE dùng cart?.items || []).
        /// </summary>
        public async Task<CartView> GetAllAsync()
        {
            var userId = CurrentUserId;
            var anonId = AnonymousId;

            var cart = await FindOpenCartAsync(userId, anonId);
            return _mapper.Map<CartView>(cart); // cart có thể là null → FE đã xử lý được
        }

        /// <summary>
        /// Thêm sản phẩm vào giỏ (anonymous được phép). Nếu đã có sản phẩm → cộng dồn quantity.
        /// Trả về CartView sau khi thêm.
        /// </summary>
        public async Task<CartView> AddItemAsync(AddCart model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var product = await _context.Products.FindAsync(model.ProductId)
                          ?? throw new ArgumentException("Sản phẩm không tồn tại.");

            var cart = await GetOrCreateOpenCartAsync();

            var exist = cart.Items.FirstOrDefault(i => i.ProductId == model.ProductId);
            if (exist == null)
            {
                await _context.CartItems.AddAsync(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = model.ProductId,
                    Quantity = Math.Max(1, model.Quantity),
                    UnitPrice = product.Price
                });
            }
            else
            {
                exist.Quantity += Math.Max(1, model.Quantity);
                _context.CartItems.Update(exist);
            }

            await _context.SaveChangesAsync();

            // nạp lại để map có Product
            await _context.Entry(cart).Collection(c => c.Items).Query().Include(i => i.Product).LoadAsync();
            return _mapper.Map<CartView>(cart);
        }

        /// <summary>
        /// Cập nhật số lượng theo productId (≤0 thì xóa). Chỉ tác động lên giỏ của chính chủ.
        /// </summary>
        public async Task<CartView> UpdateItemAsync(int productId, int quantity)
        {
            var userId = CurrentUserId;
            var anonId = AnonymousId;

            var cart = await FindOpenCartAsync(userId, anonId);
            if (cart == null) return _mapper.Map<CartView>((Cart)null!); // null view

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item == null) return _mapper.Map<CartView>(cart);

            if (quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }
            else
            {
                item.Quantity = quantity;
                _context.CartItems.Update(item);
            }

            await _context.SaveChangesAsync();
            await _context.Entry(cart).Collection(c => c.Items).Query().Include(i => i.Product).LoadAsync();
            return _mapper.Map<CartView>(cart);
        }

        /// <summary>
        /// Xóa 1 sản phẩm theo productId khỏi giỏ của chính chủ.
        /// </summary>
        public async Task<CartView> RemoveItemAsync(int productId)
        {
            var userId = CurrentUserId;
            var anonId = AnonymousId;

            var cart = await FindOpenCartAsync(userId, anonId);
            if (cart == null) return _mapper.Map<CartView>((Cart)null!);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (item != null)
            {
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync();
            }

            await _context.Entry(cart).Collection(c => c.Items).Query().Include(i => i.Product).LoadAsync();
            return _mapper.Map<CartView>(cart);
        }

        /// <summary>
        /// Gộp giỏ ẩn danh (cookie) vào giỏ user sau khi đăng nhập.
        /// </summary>
        public async Task MergeAnonymousToUserAsync()
        {
            var userId = CurrentUserId;
            var anonId = AnonymousId;

            if (userId == null || string.IsNullOrWhiteSpace(anonId)) return;

            var anonCart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => !c.Status && c.AnonymousId == anonId);

            if (anonCart == null) return;

            var userCart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => !c.Status && c.UserId == userId);

            if (userCart == null)
            {
                // Chuyển nguyên giỏ ẩn danh → giỏ user
                anonCart.UserId = userId;
                anonCart.AnonymousId = null;
            }
            else
            {
                // Gộp item (cộng dồn nếu trùng product)
                foreach (var ai in anonCart.Items.ToList())
                {
                    var ui = userCart.Items.FirstOrDefault(x => x.ProductId == ai.ProductId);
                    if (ui == null)
                    {
                        userCart.Items.Add(new CartItem
                        {
                            ProductId = ai.ProductId,
                            Quantity = ai.Quantity,
                            UnitPrice = ai.UnitPrice
                        });
                    }
                    else
                    {
                        ui.Quantity += ai.Quantity;
                    }
                }
                // Đóng giỏ ẩn danh
                anonCart.Status = true;
            }

            await _context.SaveChangesAsync();
        }
        public async Task<CartView> ClearAsync()
        {
            var userId = CurrentUserId;
            var anonId = AnonymousId;

            // chỉ tìm, KHÔNG tạo mới khi clear
            var cart = await FindOpenCartAsync(userId, anonId);
            if (cart == null)
                return _mapper.Map<CartView>((Cart)null!); // view rỗng

            if (cart.Items.Any())
            {
                _context.CartItems.RemoveRange(cart.Items);
                await _context.SaveChangesAsync();
            }

            await _context.Entry(cart).Collection(c => c.Items).LoadAsync();
            return _mapper.Map<CartView>(cart);
        }

    }
}
