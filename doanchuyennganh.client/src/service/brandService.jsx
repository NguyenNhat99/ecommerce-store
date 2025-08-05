import api from "./api";

const brandService = {
    getOne: async (id) => {
        try {
            const response = await api.get(`/brands/${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject("Lấy thương hiệu thất bại");
        }
    },
    createOne: async (data) => {
        try {
            const response = await api.post(`/brands`, data);
            return response.data;
        } catch (error) {
            return Promise.reject("Tạo mới thương hiệu thất bại");
        }
    },
    updateOne: async (id, data) => {
        try {
            const payload = { ...data, id };
            await api.put(`/brands/${id}`, payload);
            Promise.resolve("Cập nhật thành công");
        } catch {
            Promise.reject("Cập nhật thất bại");
        }
    },
    deleteOne: async (id) => {
        try {
            await api.delete(`/brands/${id}`);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject("Xóa thương hiệu thất bại");
        }
    },
    getAll: async () => {
        try {
            const response = await api.get(`/brands`);
            return response.data;
        } catch (error) {
            return Promise.reject("Lấy thương hiệu thất bại");
        }
    },
};
export default brandService;
