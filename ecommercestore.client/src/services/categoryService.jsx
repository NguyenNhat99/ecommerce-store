import api from "./api"; 

const categoryService = {
    getAll: async () => {
        try {
            const response = await api.get("/category");
            return response.data || [];  // luôn trả về array
        } catch (error) {
            console.error("API category error:", error);
            return []; // fallback về mảng rỗng để không bị undefined
        }
    },

    getOne: async (id) => {
        try {
            const response = await api.get(`/category/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Lấy thể loại thất bại";
            return Promise.reject(message);
        }
    },

    createOne: async (data) => {
        try {
            const response = await api.post('/category', data);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Tạo thể loại thất bại";
            return Promise.reject(message);
        }
    },

    updateOne: async (id, data) => {
        try {
            const payload = { ...data, id };
            await api.put(`/category/${id}`, payload);
            return Promise.resolve("Cập nhật thành công");
        } catch (error) {
            const message = error.response?.data?.message || "Cập nhật thể loại thất bại";
            return Promise.reject(message);
        }
    },

    deleteOne: async (id) => {
        try {
            await api.delete(`/category?id=${id}`);
            return Promise.resolve("Xóa thành công");
        } catch (error) {
            const message = error.response?.data?.message || "Xóa thể loại thất bại";
            return Promise.reject(message);
        }
    },
};

export default categoryService;
