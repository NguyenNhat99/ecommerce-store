// src/services/blogService.jsx
import api from "./api";

const blogService = {
    getAllEnable: async (includeDraft = false) => {
        const { data } = await api.get(`/blogs/enable`, { params: { includeDraft } });
        return data;
    },
    getAll: async () => {
        const { data } = await api.get(`/blogs`);
        return data;
    },
    getOne: async (id) => {
        const { data } = await api.get(`/blogs/${id}`);
        return data;
    },
    create: async (formData) => {
        // formData: FormData có Title, Slug, Content, IsPublished, ThumbnailFile
        const { data } = await api.post(`/blogs`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },
    update: async (id, formData) => {
        const { data } = await api.put(`/blogs/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },
    delete: async (id) => {
        const res = await api.delete(`/blogs/${id}`);
        return res.status === 204; // NoContent
    },
};

export default blogService;
