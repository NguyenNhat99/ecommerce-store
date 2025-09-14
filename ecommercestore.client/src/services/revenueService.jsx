// src/services/revenueService.jsx
import api from "./api";

const pick = (o, camel, pascal, fallback) => o?.[camel] ?? o?.[pascal] ?? fallback;

const revenueService = {
    // Tổng doanh thu toàn website (đã thanh toán)
    total: async () => {
        const { data } = await api.get(`/revenue/total`);
        // Trả về number thuần (đơn vị tùy BE: VND)
        return Number(pick(data, "total", "Total", 0)) || 0;
    },

    // Báo cáo tổng hợp theo khoảng ngày
    summary: async (from, to) => {
        const { data } = await api.get(`/revenue/reports/summary`, { params: { from, to } });
        return data; // thường đã camelCase
    },

    // Doanh thu theo ngày
    byDay: async (from, to) => {
        const { data } = await api.get(`/revenue/reports/by-day`, { params: { from, to } });
        return (data || []).map((r) => ({
            day: pick(r, "day", "Day", ""),
            amount: Number(pick(r, "amount", "Amount", 0)) || 0,
        }));
    },

    // Top sản phẩm
    topProducts: async (from, to, top = 5) => {
        const { data } = await api.get(`/revenue/reports/top-products`, { params: { from, to, top } });
        return (data || []).map((r) => ({
            name: pick(r, "name", "Name", ""),
            category: pick(r, "category", "Category", "-"),
            qty: Number(pick(r, "qty", "Qty", 0)) || 0,
            revenue: Number(pick(r, "revenue", "Revenue", 0)) || 0,
        }));
    },

    // Doanh thu theo danh mục
    categoryRevenue: async (from, to) => {
        const { data } = await api.get(`/revenue/reports/category-revenue`, { params: { from, to } });
        return (data || []).map((r) => ({
            category: pick(r, "category", "Category", "-"),
            revenue: Number(pick(r, "revenue", "Revenue", 0)) || 0,
            pct: Number(pick(r, "pct", "Pct", 0)) || 0,
        }));
    },
};

export default revenueService;
