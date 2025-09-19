import axios from "axios";
import authService from "./authService";

const api = axios.create({
    baseURL: "https://localhost:7235/api/",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = "/dang-nhap";
        }
        return Promise.reject(error);
    },
);
export default api;
