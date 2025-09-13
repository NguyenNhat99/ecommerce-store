// src/services/orderService.jsx
import api from "./api";

const orderService = {
    getAll: async () => {
        try {
            const res = await api.get("/orders");
            return res.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getOne: async (id) => {
        try {
            const res = await api.get(`/orders/${id}`);
            return res.data;
        } catch (error) {
            return Promise.reject("Lấy đơn hàng thất bại");
        }
    },

    getMyOrders: async () => {
        try {
            const res = await api.get(`/orders/MyOrder`); // ✅ đúng với BE
            return res.data;
        } catch (error) {
            return Promise.reject("Lấy đơn hàng thất bại");
        }
    },

    createCodOne: async (data) => {
        try {
            const res = await api.post("/orders/cod", data);
            return res.data;
        } catch (error) {
            const message =
                error.response?.data?.message || "Tạo đơn COD thất bại";
            return Promise.reject(message);
        }
    },

    createVnpayOne: async (data) => {
        try {
            const res = await api.post("/orders/vnpay", data);
            // BE trả { order, paymentUrl }
            return res.data;
        } catch (error) {
            const message =
                error.response?.data?.message || "Khởi tạo VNPay thất bại";
            return Promise.reject(message);
        }
    },

    vnpayReturn: async (search) => {
        const res = await api.get(`/orders/vnpay-return${search}`);
        return res.data; // { order } hoặc { orderId, status, rspCode }
    },

    // ===== NEW =====
    updatePaymentStatus: async (id, paymentStatus) => {
        try {
            const res = await api.patch(`/orders/${id}/payment-status`, {
                paymentStatus,
            });
            return res.data;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Cập nhật trạng thái thanh toán thất bại";
            return Promise.reject(message);
        }
    },

    updateOrderStatus: async (id, orderStatus) => {
        try {
            const res = await api.patch(`/orders/${id}/order-status`, {
                orderStatus,
            });
            return res.data;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Cập nhật trạng thái đơn hàng thất bại";
            return Promise.reject(message);
        }
    },
};

export default orderService;
