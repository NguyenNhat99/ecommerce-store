using EcommerceStore.Server.Data;
using EcommerceStore.Server.Helpers;
using EcommerceStore.Server.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using static EcommerceStore.Server.Controllers.RevenueController;

namespace EcommerceStore.Server.Repository.Implementations
{
    public class RevenueRepository : IRevenueRepository
    {
        private readonly EcommerceStoreContext _context;

        public RevenueRepository(EcommerceStoreContext context) {
            _context = context;
        }
        // Utilities: chuyển DateOnly -> DateTime (UTC) inclusive
        private static (DateTime fromUtc, DateTime toExclusiveUtc) ToUtcRange(DateOnly from, DateOnly to)
        {
            // giả định OrderDate đang lưu UTC; tạo khoảng [from 00:00:00, to+1 00:00:00)
            var fromUtc = from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var toExclusiveUtc = to.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            return (fromUtc, toExclusiveUtc);
        }

        public async Task<RevenueSummaryDto> GetRevenueSummaryAsync(DateOnly from, DateOnly to)
        {
            var (f, t) = ToUtcRange(from, to);

            var q = _context.Orders.Where(o => o.OrderDate >= f && o.OrderDate < t);

            var paid = q.Where(o => o.PaymentStatus == PaymentStatus.Paid);
            var refunded = q.Where(o => o.PaymentStatus == PaymentStatus.Refunded);

            var totalRevenue = await paid.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;
            var totalOrders = await paid.CountAsync();

            var refundAmount = await refunded.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;
            var refunds = await refunded.CountAsync();

            var vnpCount = await paid.CountAsync(o => o.PaymentMethod == PaymentMethodHelpers.VNPay);
            var codCount = await paid.CountAsync(o => o.PaymentMethod == PaymentMethodHelpers.COD);

            var aov = totalOrders > 0 ? totalRevenue / totalOrders : 0m;

            return new RevenueSummaryDto(totalRevenue, totalOrders, refunds, refundAmount, vnpCount, codCount, aov);
        }

        public async Task<List<RevenueByDayRow>> GetRevenueByDayAsync(DateOnly from, DateOnly to)
        {
            var (f, t) = ToUtcRange(from, to);

            var raw = await _context.Orders.AsNoTracking()
                .Where(o => o.OrderDate >= f && o.OrderDate < t && o.PaymentStatus == PaymentStatus.Paid)
                .GroupBy(o => o.OrderDate.Date)                      // OK: DateTime.Date có thể dịch
                .Select(g => new { Day = g.Key, Amount = g.Sum(x => (decimal?)x.TotalAmount) ?? 0m })
                .OrderBy(x => x.Day)
                .ToListAsync();

            var rows = raw
                .Select(x => new RevenueByDayRow(x.Day.ToString("yyyy-MM-dd"), x.Amount))
                .ToList();

            var dict = rows.ToDictionary(r => r.Day, r => r.Amount);
            var result = new List<RevenueByDayRow>();
            for (var d = from; d <= to; d = d.AddDays(1))
            {
                var key = d.ToString("yyyy-MM-dd");
                result.Add(new RevenueByDayRow(key, dict.TryGetValue(key, out var val) ? val : 0m));
            }
            return result;
        }


        public async Task<List<TopProductRow>> GetTopProductsAsync(DateOnly from, DateOnly to, int top)
        {
            var (f, t) = ToUtcRange(from, to);
            if (top <= 0) top = 5;        
            if (top > 50) top = 50;         

            var rows = await (
                from oi in _context.OrderItems.AsNoTracking()
                join o in _context.Orders.AsNoTracking() on oi.OrderId equals o.Id
                join p in _context.Products.AsNoTracking() on oi.ProductId equals p.Id
                where o.OrderDate >= f && o.OrderDate < t
                      && o.PaymentStatus == PaymentStatus.Paid
                group new { oi, p } by new
                {
                    ProductName = p.Name,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null
                }
                into g
                select new
                {
                    Name = g.Key.ProductName,
                    Category = g.Key.CategoryName ?? "-", // an toàn khi null
                    Qty = g.Sum(x => (int?)x.oi.Quantity) ?? 0,
                    // đảm bảo nhân theo decimal; nếu UnitPrice là int/long thì ép về decimal
                    Revenue = g.Sum(x => (decimal?)(x.oi.Quantity * x.oi.UnitPrice)) ?? 0m
                })
                .OrderByDescending(x => x.Revenue)
                .ThenByDescending(x => x.Qty)
                .Take(top)
                .ToListAsync();

            // Trả đúng DTO PascalCase mà controller khai báo
            return rows.Select(r => new TopProductRow(r.Name, r.Category, r.Qty, r.Revenue)).ToList();
        }

        public async Task<List<CategoryRevenueRow>> GetCategoryRevenueAsync(DateOnly from, DateOnly to)
        {
            var (f, t) = ToUtcRange(from, to);
            var rows = await (from oi in _context.OrderItems
            join o in _context.Orders on oi.OrderId equals o.Id
                              join p in _context.Products on oi.ProductId equals p.Id
                              join c in _context.Categories on p.CategoryId equals c.Id
                              where o.OrderDate >= f && o.OrderDate < t && o.PaymentStatus == PaymentStatus.Paid
                              group new { oi, c } by new { c.Id, c.CategoryName } into g
                              select new
                              {
                                  Category = g.Key.CategoryName,
                                  Revenue = g.Sum(x => x.oi.Quantity * x.oi.UnitPrice)
                              })
                             .OrderByDescending(x => x.Revenue)
                             .ToListAsync();

            var total = rows.Sum(x => x.Revenue);
            return rows.Select(r =>
                new CategoryRevenueRow(r.Category, r.Revenue, total > 0 ? Math.Round((double)(r.Revenue / total) * 100, 2) : 0)
            ).ToList();
        }
        public async Task<decimal> GetTotalRevenueAsync()
        {
            var total = await _context.Orders
              .Where(o => o.PaymentStatus == PaymentStatus.Paid)
              .SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;
            return total;
        }

    }
}
