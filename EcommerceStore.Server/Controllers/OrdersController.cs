using EcommerceStore.Server.Data;
using EcommerceStore.Server.Helpers;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Implementations;
using EcommerceStore.Server.Repository.Interfaces;
using EcommerceStore.Server.Services.EmailService;
using EcommerceStore.Server.Services.VnPayService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Net;
using System.Text;

namespace EcommerceStore.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly EcommerceStoreContext _context;
        private readonly VnPayOptions _vnOpts;
        private readonly ILogger<OrdersController> _logger;
        private readonly ICartRepository _cartRepository;
        private readonly IEmailSender _emailSender;

        public OrdersController(
            IOrderRepository orderRepository,
            EcommerceStoreContext context,
            IOptions<VnPayOptions> vnOptions,
            ILogger<OrdersController> logger,
            ICartRepository cartRepository, IEmailSender emailSender
            )
        {
            _orderRepository = orderRepository;
            _context = context;
            _vnOpts = vnOptions.Value;
            _logger = logger;
            _cartRepository = cartRepository;
            _emailSender = emailSender;
        }

        // COD (giữ nếu bạn đang dùng)
        [HttpPost("cod")]
        public async Task<IActionResult> AddOrderCod([FromBody] OrderRequestModel model)
        {
            try
            {
                var order = await _orderRepository.CreateCodOrderAsync(model);
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create COD order error");
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }

        // VNPay: khởi tạo giao dịch
        [HttpPost("vnpay")]
        public async Task<IActionResult> AddOrderVnpay([FromBody] OrderRequestModel model)
        {
            try
            {
                var (order, paymentUrl) = await _orderRepository.CreateVnPayOrderAsync(model);
                return Ok(new { order, paymentUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Init VNPay error");
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }

        // VNPay: return (FE gọi endpoint này để verify HMAC + cập nhật đơn)
        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VnPayReturn()
        {
            var query = HttpContext.Request.Query;

            var lib = new VnPayLibrary();
            foreach (var kv in query)
                if (kv.Key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase))
                    lib.AddResponseData(kv.Key, kv.Value!);

            var vnpSecureHash = query["vnp_SecureHash"].ToString();
            if (!lib.ValidateSignature(vnpSecureHash, _vnOpts.HashSecret))
                return BadRequest(new { message = "Chữ ký không hợp lệ" });

            var rspCode = query["vnp_ResponseCode"].ToString(); // "00" success
            var orderId = query["vnp_TxnRef"].ToString();
            var payDateStr = query["vnp_PayDate"].ToString();
            var amountStr = query["vnp_Amount"].ToString(); // VND x 100
            var bankCode = query["vnp_BankCode"].ToString();
            var transNo = query["vnp_TransactionNo"].ToString();
            var bankTranNo = query["vnp_BankTranNo"].ToString();

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng" });

            // ✅ Idempotency
            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                return Ok(new
                {
                    message = "Đơn đã được thanh toán.",
                    order = new { order.Id, order.TotalAmount, order.PaymentDate, order.OrderStatus, order.PaymentStatus }
                });
            }

            // ✅ Đối chiếu số tiền
            if (long.TryParse(amountStr, out var amountVnp) == false)
                return BadRequest(new { message = "Số tiền không hợp lệ" });

            var expected = (long)(order.TotalAmount * 100m);
            if (amountVnp != expected)
                return BadRequest(new { message = "Số tiền không khớp" });

            try
            {
                if (rspCode == "00")
                {
                    order.PaymentStatus = PaymentStatus.Paid;
                    order.OrderStatus = OrderStatus.Pending; // tiếp tục quy trình xử lý
                    order.PaymentMethod = PaymentMethodHelpers.VNPay; // nếu bạn có enum riêng

                    // ✅ parse PayDate (VN time) -> UTC
                    if (!string.IsNullOrEmpty(payDateStr) &&
                        DateTime.TryParseExact(payDateStr, "yyyyMMddHHmmss", null, System.Globalization.DateTimeStyles.None, out var payLocal))
                    {
                        var tz = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); // Windows
                        var utc = TimeZoneInfo.ConvertTimeToUtc(payLocal, tz);
                        order.PaymentDate = utc;
                    }
                    else
                    {
                        order.PaymentDate = DateTime.UtcNow;
                    }

                    // ✅ Lưu metadata giao dịch
                    order.TransactionId = transNo;   // thêm cột nếu chưa có

                    // ✅ Đóng/khoá giỏ & (tùy chọn) trừ tồn kho
                    var userId = order.UserId;
                    var anonId = order.AnonymousId;
                    var cart = await _cartRepository.FindOpenCartAsync(userId, anonId);
                    if (cart != null)
                    {
                        cart.Status = true;
                        // foreach (var oi in order.OrderItems) { product.Stock -= oi.Quantity; }
                    }

                    await _context.SaveChangesAsync();

                    // (Tùy chọn) Gửi email xác nhận
                    if (!string.IsNullOrWhiteSpace(order.CustomerEmail))
                    {
                        var html = BuildOrderEmailHtml(order, cart.Items);
                        var subject = $"[EcommerceStore] Xác nhận đặt hàng #{order.Id}";
                        await _emailSender.SendEmailAsync(order.CustomerEmail, subject, html);
                    }

                    return Ok(new
                    {
                        order = new
                        {
                            order.Id,
                            order.TotalAmount,
                            order.PaymentMethod,
                            order.CustomerName,
                            order.CustomerPhone,
                            order.CustomerEmail,
                            order.ShippingAddress,
                            order.PaymentStatus,
                            order.OrderStatus,
                            order.PaymentDate,
                            order.TransactionId
                        }
                    });
                }
                else
                {
                    order.PaymentStatus = PaymentStatus.Failed;
                    order.OrderStatus = OrderStatus.Cancel; // (tuỳ policy)
                                                               // (tùy chọn) mở lại cart nếu bạn đang “lock”
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        orderId = order.Id,
                        status = order.PaymentStatus.ToString(),
                        rspCode = rspCode
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "VNPAY return handle error");
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }
        public static string BuildOrderEmailHtml(Order order, IEnumerable<CartItem> itemsInCart)
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
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var orders = await _orderRepository.GetAllAsync();
                return Ok(orders);
            }
            catch
            {
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var order = await _orderRepository.GetByIdAsync(id);
                if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng" });
                return Ok(order);
            }
            catch
            {
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }
        [HttpGet("MyOrder")]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                var orders = await _orderRepository.MyOrder();
                if (!orders.Any()) return NotFound(new { message = "Tài khoản chưa có bất kỳ đơn hàng nào" });
                return Ok(orders);
            }
            catch
            {
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }
        // DTOs gọn
        public record UpdatePaymentStatusDto(string PaymentStatus);
        public record UpdateOrderStatusDto(string OrderStatus);

        /// <summary>
        /// Cập nhật trạng thái thanh toán: Pending | Paid | Failed | Refunded | Processing
        /// </summary>
        [HttpPatch("{id}/payment-status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdatePaymentStatus(string id, [FromBody] UpdatePaymentStatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(dto?.PaymentStatus))
                return BadRequest(new { message = "Thiếu tham số" });

            var ok = await _orderRepository.UpdatePaymentStatusAsync(id, dto.PaymentStatus);
            return ok ? Ok(new { message = "Cập nhật PaymentStatus thành công", id, paymentStatus = dto.PaymentStatus })
                      : BadRequest(new { message = "PaymentStatus không hợp lệ hoặc đơn không tồn tại" });
        }

        /// <summary>
        /// Cập nhật trạng thái đơn hàng: awaitpay | pend | processing | shipped | success | cancel | err
        /// </summary>
        [HttpPatch("{id}/order-status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(dto?.OrderStatus))
                return BadRequest(new { message = "Thiếu tham số" });

            var ok = await _orderRepository.UpdateOrderStatusAsync(id, dto.OrderStatus);
            return ok ? Ok(new { message = "Cập nhật OrderStatus thành công", id, orderStatus = dto.OrderStatus })
                      : BadRequest(new { message = "OrderStatus không hợp lệ hoặc đơn không tồn tại" });
        }
        [HttpGet("count-order")]
        public async Task<IActionResult> CountOrderPending()
        {
            try
            {
                var count = await _orderRepository.countOrderPending();
                return Ok(count);
            }
            catch
            {
                return StatusCode(500, new { message = "Lỗi server ! Vui lòng thử lại sau" });
            }
        }

        [HttpGet("recent")]
        public async Task<IActionResult> Recent([FromQuery] int limit = 6)
        {
            var list = await _orderRepository.GetRecentAsync(limit);
            return Ok(list);
        }
        [HttpGet("track")]
        public async Task<IActionResult> PublicTrack([FromQuery] string orderId, [FromQuery] string contact)
        {
            var dto = await _orderRepository.PublicTrackAsync(orderId, contact);
            return dto == null ? NotFound() : Ok(dto);
        }
    }
}
    