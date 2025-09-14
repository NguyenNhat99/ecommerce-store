import api from "./api";

const productService = {
    createOne: async (data) => {
        try {
            const response = await api.post(`/products`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response)
            return response.data;
        } catch (error) {
            return Promise.reject("Tạo sản phẩm thất bại", error);
        }
    },

    updateOne: async (id, data) => {
        try {
            const response = await api.put(`/products/${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return Promise.reject("Cập nhật sản phẩm thất bại", error);
        }
    },

    getAll: async () => {
        try {
            const response = await api.get(`/products`);
            return response.data;
        } catch (error) {
            return Promise.reject("Lấy sản phẩm thất bại", error);
        }
    },
    countProducts: async () => {
        try {
            const response = await api.get(`/products/count-products`);
            return response.data;
        } catch (error) {
            return Promise.reject("Lấy số lượng sản phẩm thất bại", error);
        }
    },
    getOne: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject("Lấy sản phẩm thất bại", error);
        }
    },

    deleteOne: async (id) => {
        try {
            await api.delete(`/products/${id}`);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject("Xóa sản phẩm thất bại", error);
        }
    },
};

export default productService;
