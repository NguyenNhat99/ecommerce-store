import api from "./api";

const login = async (email, password) => {
    try {
        const res = await api.post(`/accounts/auth/signin`, {
            email,
            password,
        });

        const token = res.data;
        localStorage.setItem("jwt_token", token);
        return token;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                throw new Error("Email hoặc mật khẩu không đúng!");
            }
            if (error.response.status === 500) {
                throw new Error("Lỗi hệ thống. Vui lòng thử lại sau!");
            }
        }
        throw new Error("Không thể kết nối đến máy chủ!");
    }
};

const signUp = async (data) => {
    try {
        const res = await api.post('/accounts/auth/singup', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Lỗi không xác định';
    }
};

const getCurrentUser = async () => {
    try {
        const token = getToken();
        if (!token) return null;
        const res = await api.get(`/accounts/auth/GetUser`, {
            headers: { Authorization: `bearer ${token}` },
        });
        return res.data;
    } catch {
        logout();
        return null;
    }
};

const updatePassword = async (currentPassword, newPassword) => {
    try {
        const res = await api.post(`/accounts/auth/changePassword`, {
            currentPassword, newPassword
        });
        return true;
    } catch (error) {
        return false;
    }
};

const updateInformation = async (updateData) => {
    try {
        const res = await api.post('/accounts/auth/changeInformation', updateData);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Lỗi không xác định';
    }
};
const forgotPassword = async (email) => {
    try {
        const res = await api.post(`/accounts/auth/forgot-password`, { email });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Lỗi khi gửi email khôi phục mật khẩu';
    }
};

const resetPassword = async ({ email, token, newPassword }) => {
    try {
        const res = await api.post('/accounts/auth/reset-password', {
            email,
            token,
            newPassword
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Lỗi không xác định';
    }
};
const getAllAccounts = async () => {
    try {
        const res = await api.get('/accounts/auth/list');
        return res.data; // Đây là mảng AccountModel
    } catch (error) {
        throw error.response?.data || error.message || 'Không thể lấy danh sách tài khoản!';
    }
};
const getAccountDetail = async (email) => {
    try {
        const res = await api.get(`/accounts/auth/detail/${encodeURIComponent(email)}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Không thể lấy chi tiết tài khoản!';
    }
};


const logout = () => {
    localStorage.removeItem("jwt_token");
    window.location.reload();
};

const getToken = () => {
    return localStorage.getItem("jwt_token");
};

export default {
    login,
    logout,
    getToken,
    getCurrentUser,
    updatePassword,
    updateInformation,
    signUp, 
    forgotPassword,
    resetPassword,
    getAllAccounts,
    getAccountDetail
};
