import api from "./api";
const login = async (email, password) => {
    try {
        const res = await api.post(`/accounts/auth/signin`, {
            email,
            password,
        });
        console.log(res);
        const token = res.data;
        localStorage.setItem("jwt_token", token);
        return token;
    } catch {
        throw new Error("Lỗi");
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
        // Tự động logout nếu token không hợp lệ
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
}
const updateInformation = async (updateData) => {
    try {
        const res = await api.post('/accounts/auth/changeInformation', updateData);
        return res.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Lỗi không xác định';
    }
}
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
    updateInformation
};
