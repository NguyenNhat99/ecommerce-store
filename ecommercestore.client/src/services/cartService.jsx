import api from "./api";

// api: Axios đã cấu hình baseURL và credentials nếu cần

const cartService = {
    // Lấy giỏ hiện tại
    getCart: async () => {
        const { data } = await api.get("/carts");
        return data;
    },

    // Thêm sản phẩm vào giỏ
    addItem: async (productId, quantity = 1) => {
        const { data } = await api.post("/carts/items", { productId, quantity });
        return data;
    },

    // Cập nhật số lượng sản phẩm
    updateItem: async (productId, quantity) => {
        const { data } = await api.put(`/carts/items/${productId}`, { quantity });
        return data;
    },

    // Xóa 1 sản phẩm
    removeItem: async (productId) => {
        const { data } = await api.delete(`/carts/items/${productId}`);
        return data;
    },

    // Xóa toàn bộ giỏ (trả về CartView rỗng)
    clear: async () => {
        const { data } = await api.delete("/carts");
        return data;
    },

    // Gộp giỏ anonymous vào giỏ user sau khi login
    merge: async () => {
        const { data } = await api.post("/carts/merge");
        return data;
    },
};

export default cartService;
