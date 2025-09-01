import api from "./api";

// api: Axios đã cấu hình baseURL và credentials nếu cần

const cartService = {
    getCart: async () => {
        const { data } = await api.get("/carts");
        return data;
    },
    addItem: async (productId, quantity = 1) => {
        const { data } = await api.post("/carts/items", { productId, quantity });
        return data;
    },
    updateItem: async (productId, quantity) => {
        const { data } = await api.put(`/carts/items/${productId}`, { quantity });
        return data;
    },
    removeItem: async (productId) => {
        const { data } = await api.delete(`/carts/items/${productId}`);
        return data;
    },
    clear: async () => {
        await api.delete("/carts");
    },
};

export default cartService;
