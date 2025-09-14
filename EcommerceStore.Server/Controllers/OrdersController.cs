using EcommerceStore.Server.Data;
using EcommerceStore.Server.Helpers;
using EcommerceStore.Server.Models;
using EcommerceStore.Server.Repository.Implementations;
using EcommerceStore.Server.Repository.Interfaces;
using EcommerceStore.Server.Services.VnPayService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

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

        public OrdersController(
            IOrderRepository orderRepository,
            EcommerceStoreContext context,
            IOptions<VnPayOptions> vnOptions,
            ILogger<OrdersController> logger,
            ICartRepository cartRepository)
        {
            _orderRepository = orderRepository;
            _context = context;
            _vnOpts = vnOptions.Value;
            _logger = logger;
            _cartRepository = cartRepository;
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
                    // await _emailSender.SendEmailAsync(...)

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
    