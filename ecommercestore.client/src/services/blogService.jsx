import axios from "axios";

const API_URL = "https://localhost:7235/api/blogs";

const blogService = {
    getAll: async () => {
        const res = await axios.get(API_URL);
        return res.data;
    },
    getOne: async (id) => {
        const res = await axios.get(`${API_URL}/${id}`);
        return res.data;
    },
};

export default blogService;