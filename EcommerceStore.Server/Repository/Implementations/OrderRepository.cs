using AutoMapper;
using EcommerceStore.Server.Data;
using EcommerceStore.Server.Helpers;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Interfaces;
using EcommerceStore.Server.Services.EmailService;
using EcommerceStore.Server.Services.VnPayService;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net;
using System.Text;
using static System.Net.WebRequestMethods;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class OrderRepository : IOrderRepository
    {
        private readonly EcommerceStoreContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<User> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly IMapper _mapper;
        private readonly VnPayOptions _vnOptions;
        private const string CART_COOKIE = "cart_id";
        public OrderRepository(EcommerceStoreContext context, 
            IMapper mapper, 
            IHttpContextAccessor httpContextAccessor, 
            UserManager<User> userManager, 
            IEmailSender emailSender, IOptions<VnPayOptions> vnOptions) {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
            _emailSender = emailSender;
            _mapper = mapper;
            _vnOptions = vnOptions.Value;
        }
        private string? CurrentUserId
        {
            get
            {
                var principal = _httpContextAccessor.HttpContext?.User;
                if (principal?.Identity?.IsAuthenticated != true) return null;
                return _userManager.GetUserId(principal);
            }
        }
        private string? AnonymousId =>
           _httpContextAccessor.HttpContext?.Request?.Cookies?[CART_COOKIE];
        private async Task<Cart?> FindOpenCartAsync(string? userId, string? anonId)
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
        public async Task<OrderResponseModel> CreateCodOrderAsync(OrderRequestModel model)
        {
                if (model == null) throw new ArgumentNullException("model");

                var userId = CurrentUserId;
                var anonId = AnonymousId;

                var cart = await FindOpenCartAsync(userId, anonId);
                if (cart == null) throw new InvalidOperationException("Giỏ hàng không tồn tại hoặc trống.");

                var code = $"ORD{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6]}";
                decimal totalAmount = 0;
                var newOrder = new Order()
                {
                    Id = code,
                    UserId = userId,
                    AnonymousId = anonId,
                    CustomerEmail = model.CustomerEmail,
                    CustomerName = model.CustomerName,
                    CustomerPhone = model.CustomerPhone,
                    ShippingAddress = model.ShippingAddress,
                    Note = model.Note,
                    OrderDate = DateTime.UtcNow,
                    OrderStatus = OrderStatus.Pending,
                    PaymentMethod = model.PaymentMethod,
                    PaymentDate = DateTime.UtcNow,
                    PaymentStatus = PaymentStatus.Pending,
                };
                await _context.Orders.AddAsync(newOrder);

                foreach (var item in cart.Items)
                {
                    var newOrderItem = new OrderItem()
                    {
                        Quantity = item.Quantity,
                        OrderId = newOrder.Id,
                        ProductId = item.ProductId,
                        UnitPrice = item.UnitPrice,
                    };
                    totalAmount += (item.UnitPrice * item.Quantity);
                    _context.OrderItems.Add(newOrderItem);
                }
                newOrder.TotalAmount = totalAmount;
                cart.Status = true;
                await _context.SaveChangesAsync();
            try
            {
                if (!string.IsNullOrWhiteSpace(newOrder.CustomerEmail))
                {
                    var html = BuildOrderEmailHtml(newOrder, cart.Items);
                    var subject = $"[EcommerceStore] Xác nhận đặt hàng #{newOrder.Id}";
                    await _emailSender.SendEmailAsync(newOrder.CustomerEmail, subject, html);
                }
            }
            catch
            {

            }
            return _mapper.Map<OrderResponseModel>(newOrder);
           
        }

        public async Task<(OrderResponseModel, string paymentUrl)> CreateVnPayOrderAsync(OrderRequestModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var userId = CurrentUserId;
            var anonId = AnonymousId;

            var cart = await FindOpenCartAsync(userId, anonId);
            if (cart == null || cart.Items.Count == 0)
                throw new InvalidOperationException("Giỏ hàng không tồn tại hoặc trống.");

            // ✅ Tính tiền từ DB, kiểm tra tồn kho
            decimal totalAmount = 0m;
            foreach (var item in cart.Items)
            {
                // (khuyến nghị) reload price/stock từ DB nếu cần
                totalAmount += item.UnitPrice * item.Quantity;
                // if (item.Product.Stock < item.Quantity) throw ...
            }

            var code = $"ORD{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}".Substring(0, 28);
            var newOrder = new Order
            {
                Id = code,
                UserId = userId,
                AnonymousId = anonId,
                CustomerEmail = model.CustomerEmail,
                CustomerName = model.CustomerName,
                CustomerPhone = model.CustomerPhone,
                ShippingAddress = model.ShippingAddress,
                Note = model.Note,
                OrderDate = DateTime.UtcNow,
                OrderStatus = OrderStatus.AwaitingPayment, // ✅ chờ thanh toán
                PaymentMethod = model.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                TotalAmount = totalAmount
            };

            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Orders.AddAsync(newOrder);

                foreach (var it in cart.Items)
                {
                    _context.OrderItems.Add(new OrderItem
                    {
                        OrderId = newOrder.Id,
                        ProductId = it.ProductId,
                        Quantity = it.Quantity,
                        UnitPrice = it.UnitPrice
                    });
                }

                // ❌ KHÔNG khóa cart ở đây. Tùy chọn: cart.IsLocked = true; cart.LockedUntil = DateTime.UtcNow.AddMinutes(30);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }

            // Build URL VNPay
            var amountVnp = (long)(newOrder.TotalAmount * 100); // VND x 100
            var vn = new VnPayLibrary();
            vn.AddRequestData("vnp_Version", VnPayLibrary.VERSION);
            vn.AddRequestData("vnp_Command", "pay");
            vn.AddRequestData("vnp_TmnCode", _vnOptions.TmnCode);
            vn.AddRequestData("vnp_Amount", amountVnp.ToString());
            vn.AddRequestData("vnp_CreateDate", DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss")); // giờ VN
            vn.AddRequestData("vnp_CurrCode", "VND");

            var rawIp = Utils.GetIpAddress(_httpContextAccessor.HttpContext);
            var ipAddr = string.IsNullOrWhiteSpace(rawIp) ? "127.0.0.1" : (rawIp == "::1" ? "127.0.0.1" : rawIp);
            vn.AddRequestData("vnp_IpAddr", ipAddr);

            vn.AddRequestData("vnp_Locale", string.IsNullOrWhiteSpace(_vnOptions.Locale) ? "vn" : _vnOptions.Locale);
            vn.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang {newOrder.Id}");
            vn.AddRequestData("vnp_OrderType", "other");
            vn.AddRequestData("vnp_ReturnUrl", _vnOptions.ReturnUrl); // trỏ về /api/orders/vnpay-return
            vn.AddRequestData("vnp_TxnRef", newOrder.Id);

            vn.AddRequestData("vnp_BankCode", ""); // Để trống để user chọn
            vn.AddRequestData("vnp_ExpireDate", DateTime.UtcNow.AddHours(7).AddMinutes(15).ToString("yyyyMMddHHmmss"));

            var paymentUrl = vn.CreateRequestUrl(_vnOptions.BaseUrl, _vnOptions.HashSecret);

            // (Tùy chọn) Lưu PaymentIntent sơ bộ ở đây (TxnRef, Amount, CreatedAt...)
            var dto = _mapper.Map<OrderResponseModel>(newOrder);
            return (dto, paymentUrl);
        }

        private static string BuildOrderEmailHtml(Order order, IEnumerable<CartItem> itemsInCart)
        {
            var sb = new StringBuilder();
            sb.AppendLine("<div style='font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#222'>");
            sb.AppendLine($"  <h2>✅ Đặt hàng thành công</h2>");
            sb.AppendLine($"  <p>Xin chào <strong>{WebUtility.HtmlEncode(order.CustomerName)}</strong>,</p>");
            sb.AppendLine("  <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.</p>");
            sb.AppendLine("  <hr/>");

            sb.AppendLine("  <h3 style='margin:16px 0 8px'>Thông tin đơn hàng</h3>");
            sb.AppendLine("  <table style='border-collapse:collapse;width:100%'>");
            sb.AppendLine("    <tr><td style='padding:6px 0'>Mã đơn hàng:</td><td><strong>" + order.Id + "</strong></td></tr>");
            sb.AppendLine("    <tr><td style='padding:6px 0'>Ngày đặt:</td><td>" + order.OrderDate.ToLocalTime().ToString("dd/MM/yyyy HH:mm") + "</td></tr>");
            sb.AppendLine("    <tr><td style='padding:6px 0'>Người nhận:</td><td>" + WebUtility.HtmlEncode(order.CustomerName) + "</td></tr>");
            sb.AppendLine("    <tr><td style='padding:6px 0'>Email:</td><td>" + WebUtility.HtmlEncode(order.CustomerEmail ?? "") + "</td></tr>");
            sb.AppendLine("    <tr><td style='padding:6px 0'>Số điện thoại:</td><td>" + WebUtility.HtmlEncode(order.CustomerPhone ?? "") + "</td></tr>");
            sb.AppendLine("    <tr><td style='padding:6px 0'>Địa chỉ giao hàng:</td><td>" + WebUtility.HtmlEncode(order.ShippingAddress ?? "") + "</td></tr>");
            sb.AppendLine("  </table>");

            sb.AppendLine("  <h3 style='margin:16px 0 8px'>Sản phẩm</h3>");
            sb.AppendLine("  <table style='border-collapse:collapse;width:100%'>");
            sb.AppendLine("    <thead>");
            sb.AppendLine("      <tr>");
            sb.AppendLine("        <th style='text-align:left;border-bottom:1px solid #ddd;padding:8px 0'>Sản phẩm</th>");
            sb.AppendLine("        <th style='text-align:center;border-bottom:1px solid #ddd;padding:8px 0'>SL</th>");
            sb.AppendLine("        <th style='text-align:right;border-bottom:1px solid #ddd;padding:8px 0'>Đơn giá</th>");
            sb.AppendLine("        <th style='text-align:right;border-bottom:1px solid #ddd;padding:8px 0'>Thành tiền</th>");
            sb.AppendLine("      </tr>");
            sb.AppendLine("    </thead>");
            sb.AppendLine("    <tbody>");

            foreach (var ci in itemsInCart)
            {
                var name = ci.Product?.Name ?? $"SP#{ci.ProductId}";
                var lineTotal = ci.UnitPrice * ci.Quantity;
                sb.AppendLine("      <tr>");
                sb.AppendLine("        <td style='padding:6px 0'>" + WebUtility.HtmlEncode(name) + "</td>");
                sb.AppendLine("        <td style='text-align:center;padding:6px 0'>" + ci.Quantity + "</td>");
                sb.AppendLine("        <td style='text-align:right;padding:6px 0'>" + FormatVnd(ci.UnitPrice) + "</td>");
                sb.AppendLine("        <td style='text-align:right;padding:6px 0'>" + FormatVnd(lineTotal) + "</td>");
                sb.AppendLine("      </tr>");
            }

            sb.AppendLine("    </tbody>");
            sb.AppendLine("  </table>");

            sb.AppendLine("  <div style='margin-top:12px;text-align:right'>");
            sb.AppendLine("    <div><span style='display:inline-block;min-width:140px'>Tạm tính:</span> <strong>" + FormatVnd(order.TotalAmount) + "</strong></div>");
            // Nếu bạn có phí ship trong Order, cộng thêm dòng ở đây
            // sb.AppendLine("    <div><span style='display:inline-block;min-width:140px'>Phí vận chuyển:</span> <strong>" + FormatVnd(order.ShippingFee) + "</strong></div>");
            // sb.AppendLine("    <div><span style='display:inline-block;min-width:140px'>Tổng cộng:</span> <strong>" + FormatVnd(order.TotalAmount + order.ShippingFee) + "</strong></div>");
            sb.AppendLine("  </div>");

            sb.AppendLine("  <p style='margin-top:16px'>Phương thức thanh toán: <strong>" + WebUtility.HtmlEncode(order.PaymentMethod.ToString()) + "</strong></p>");
            if (!string.IsNullOrWhiteSpace(order.Note))
            {
                sb.AppendLine("  <p>Ghi chú: " + WebUtility.HtmlEncode(order.Note) + "</p>");
            }

            sb.AppendLine("  <hr/>");
            sb.AppendLine("  <p>Mọi thắc mắc vui lòng phản hồi email này hoặc liên hệ CSKH của chúng tôi.</p>");
            sb.AppendLine("</div>");
            return sb.ToString();
        }
        private static string FormatVnd(decimal n)
      => string.Format(new CultureInfo("vi-VN"), "{0:#,0} ₫", n);

        public async Task<List<OrderResponseModel>> GetAllAsync()
        {
            var orders = await _context.Orders.ToListAsync();
            return _mapper.Map<List<OrderResponseModel>>(orders);
        }

        public async Task<OrderResponseModel> GetByIdAsync(string id)
        {
            var order = await _context.Orders.FindAsync(id);
            return _mapper.Map<OrderResponseModel>(order);
        }
        public async Task<List<OrderResponseModel>> MyOrder()
        {
            if (CurrentUserId == null) throw new ArgumentNullException("model");
            var orders = await _context.Orders.Where(o => o.UserId.Equals(CurrentUserId)).ToListAsync();
            return _mapper.Map<List<OrderResponseModel>>(orders);
        }

        public async Task<bool> UpdatePaymentStatusAsync(string id, string paymentStatus)
        {
            // Validate tập giá trị cho phép
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        { PaymentStatus.Pending, PaymentStatus.Paid, PaymentStatus.Failed, PaymentStatus.Refunded, PaymentStatus.Processing };

            if (!allowed.Contains(paymentStatus)) return false;

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return false;

            // Nếu set Paid thì gán PaymentDate nếu chưa có
            if (paymentStatus.Equals(PaymentStatus.Paid, StringComparison.OrdinalIgnoreCase) && order.PaymentDate == null)
            {
                order.PaymentDate = DateTime.UtcNow;

                // Nếu trước đó là awaitpay thì đẩy sang pend (chờ xử lý)
                if (order.OrderStatus.Equals(OrderStatus.AwaitingPayment, StringComparison.OrdinalIgnoreCase))
                {
                    order.OrderStatus = OrderStatus.Pending;
                }
            }

            order.PaymentStatus = paymentStatus;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateOrderStatusAsync(string id, string orderStatus)
        {
            // Validate tập giá trị cho phép
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            OrderStatus.AwaitingPayment, OrderStatus.Pending, OrderStatus.Processing,
            OrderStatus.Shipped, OrderStatus.Success, OrderStatus.Cancel, OrderStatus.Error
        };

            if (!allowed.Contains(orderStatus)) return false;

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return false;

            order.OrderStatus = orderStatus;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
