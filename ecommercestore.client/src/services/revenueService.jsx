// src/services/revenueService.jsx
import api from "./api";

const pick = (o, camel, pascal, fallback) => o?.[camel] ?? o?.[pascal] ?? fallback;

const revenueService = {
    summary: async (from, to) => {
        const { data } = await api.get(`/revenue/reports/summary`, { params: { from, to } });
        // API .NET thường đã camelCase sẵn; cứ trả về trực tiếp
        return data;
    },
    byDay: async (from, to) => {
        const { data } = await api.get(`/revenue/reports/by-day`, { params: { from, to } });
        return (data || []).map(r => ({
            day: pick(r, "day", "Day", ""),
            amount: Number(pick(r, "amount", "Amount", 0)) || 0,
        }));
    },
    topProducts: async (from, to, top = 5) => {
        const { data } = await api.get(`/revenue/reports/top-products`, { params: { from, to, top } });
        return (data || []).map(r => ({
            name: pick(r, "name", "Name", ""),
            category: pick(r, "category", "Category", "-"),
            qty: Number(pick(r, "qty", "Qty", 0)) || 0,
            revenue: Number(pick(r, "revenue", "Revenue", 0)) || 0,
        }));
    },
    categoryRevenue: async (from, to) => {
        const { data } = await api.get(`/revenue/reports/category-revenue`, { params: { from, to } });
        return (data || []).map(r => ({
            category: pick(r, "category", "Category", "-"),
            revenue: Number(pick(r, "revenue", "Revenue", 0)) || 0,
            pct: Number(pick(r, "pct", "Pct", 0)) || 0,
        }));
    },
};

export default revenueService;
