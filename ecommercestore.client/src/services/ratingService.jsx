import api from "./api";

const ratingService = {
    // lấy danh sách đánh giá theo productId
    getByProduct: async (productId) => {
        const { data } = await api.get(`/ratings/product/${productId}`);
        return data;
    },

    // NEW: lấy summary (avg + count) — trả về { avg: number, count: number }
    getSummary: async (productId) => {
        const { data } = await api.get(`/ratings/product/${productId}`);
        const ratings = Array.isArray(data) ? data : [];
        const count = ratings.length;
        const avg =
            count > 0
                ? ratings.reduce((s, r) => s + Number(r.rating ?? 0), 0) / count
                : 0;
        return { avg, count };
    },

    // thêm mới
    add: async (payload) => {
        const { data } = await api.post("/ratings", payload);
        console.log(data);
        return data;
    },

    // cập nhật
    update: async (id, payload) => {
        await api.put(`/ratings/${id}`, payload);
        return true;
    },

    // xóa
    delete: async (id) => {
        await api.delete(`/ratings/${id}`);
        return true;
    },
};

export default ratingService;