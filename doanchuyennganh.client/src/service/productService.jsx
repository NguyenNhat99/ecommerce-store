import api from "./api";

const productService = {
    createOne: async (data) => {
        try {
            const response = await api.post(`/products`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return Promise.reject("Tạo sản phẩm thất bại");
        }
    },
    getAll: async () => {
        try {
            const response = await api.get(`/products`);
            return response.data;
        } catch (error) {
            return Promise.reject("Lấy sản phẩm thất bại");
        }
    },
    deleteOne: async (id) => {
        try {
            await api.delete(`/products/${id}`);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject("Xóa sản phâlmr thất bại");
        }
    },
};

export default productService;
