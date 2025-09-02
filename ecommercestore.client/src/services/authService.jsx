// src/services/authService.js
import api from "./api";

/* ========== AUTH ========== */
const login = async (email, password) => {
    try {
        const res = await api.post(`/accounts/auth/signin`, { email, password });
        const token = res.data;
        localStorage.setItem("jwt_token", token);
        return token;
    } catch (error) {
        const status = error?.response?.status;
        if (status === 401) throw new Error("Email hoặc mật khẩu không đúng!");
        if (status === 423) throw new Error("Tài khoản đang bị khóa!"); // nếu backend trả 423 Locked
        if (status === 500) throw new Error("Lỗi hệ thống. Vui lòng thử lại sau!");
        throw new Error("Không thể kết nối đến máy chủ!");
    }
};

const signUp = async (data) => {
    try {
        // Sửa typo: 'singup' -> 'signup' (đảm bảo route controller cũng là signup)
        const res = await api.post("/accounts/auth/signup", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Lỗi không xác định";
    }
};

const getCurrentUser = async () => {
    try {
        const token = getToken();
        if (!token) return null;
        const res = await api.get(`/accounts/auth/getuser`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch {
        logout();
        return null;
    }
};

const updatePassword = async (currentPassword, newPassword) => {
    try {
        await api.post(`/accounts/auth/changePassword`, { currentPassword, newPassword });
        return true;
    } catch {
        return false;
    }
};

const updateInformation = async (updateData) => {
    try {
        const res = await api.post("/accounts/auth/changeInformation", updateData);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Lỗi không xác định";
    }
};

const forgotPassword = async (email) => {
    try {
        const res = await api.post(`/accounts/auth/forgot-password`, { email });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Lỗi khi gửi email khôi phục mật khẩu";
    }
};

const resetPassword = async ({ email, token, newPassword }) => {
    try {
        const res = await api.post("/accounts/auth/reset-password", { email, token, newPassword });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Lỗi không xác định";
    }
};

/* ========== ACCOUNTS (Admin) ========== */
const getAllAccounts = async () => {
    try {
        const res = await api.get("/accounts/auth/list");
        return res.data; // mảng AccountModel
    } catch (error) {
        throw error.response?.data || error.message || "Không thể lấy danh sách tài khoản!";
    }
};

const getAccountDetail = async (email) => {
    try {
        const res = await api.get(`/accounts/auth/detail/${encodeURIComponent(email)}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || "Không thể lấy chi tiết tài khoản!";
    }
};

/* ===== NEW: LOCK / UNLOCK / ENABLE LOCKOUT ===== */
// Khóa tài khoản đến thời điểm "until" (ISO string hoặc Date). Nếu không truyền until, backend mặc định 15 phút.
const lockAccount = async (email, until) => {
    try {
        const payload = { email };
        if (until) {
            // chấp nhận Date hoặc string: chuẩn hóa ISO (UTC)
            payload.until = typeof until === "string" ? until : new Date(until).toISOString();
        }
        const res = await api.post("/accounts/lock", payload);
        return res.status === 200;
    } catch (error) {
        const status = error?.response?.status;
        if (status === 404) throw new Error("Không tìm thấy tài khoản để khóa!");
        throw error.response?.data || error.message || "Khóa tài khoản thất bại!";
    }
};

// Mở khóa tài khoản (xóa LockoutEnd + reset AccessFailedCount)
const unlockAccount = async (email) => {
    try {
        const res = await api.post("/accounts/unlock", { email });
        return res.status === 200;
    } catch (error) {
        const status = error?.response?.status;
        if (status === 404) throw new Error("Không tìm thấy tài khoản để mở khóa!");
        throw error.response?.data || error.message || "Mở khóa tài khoản thất bại!";
    }
};

// Bật / tắt tính năng lockout cho user (không phải khóa ngay)
const setLockoutEnabled = async (email, enabled) => {
    try {
        const res = await api.post("/accounts/lockout-enabled", { email, enabled });
        return res.status === 200;
    } catch (error) {
        const status = error?.response?.status;
        if (status === 404) throw new Error("Không tìm thấy tài khoản!");
        throw error.response?.data || error.message || "Cập nhật lockout thất bại!";
    }
};

/* ========== TOKEN UTILS ========== */
const logout = () => {
    localStorage.removeItem("jwt_token");
    window.location.reload();
};
const getToken = () => localStorage.getItem("jwt_token");

export default {
    // auth
    login,
    logout,
    getToken,
    getCurrentUser,
    updatePassword,
    updateInformation,
    signUp,
    forgotPassword,
    resetPassword,
    // accounts
    getAllAccounts,
    getAccountDetail,
    // lockout
    lockAccount,
    unlockAccount,
    setLockoutEnabled,
};
