// src/context/AuthContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import authService from "../services/authService"; // dùng service đã có sẵn route đúng

const AuthContext = createContext({
    user: null,
    loading: true,
    login: async (_payload) => { },
    logout: async () => { },
    refreshUser: async () => { },
});

export default AuthContext;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const me = await authService.getCurrentUser(); // GET /accounts/auth/GetUser
            setUser(me || null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(
        async ({ email, password /*, remember*/ }) => {
            // POST /accounts/auth/signin -> nhận token & lưu vào localStorage
            await authService.login(email, password);
            await refreshUser();
        },
        [refreshUser]
    );

    const logout = useCallback(async () => {
        // nếu authService.logout() có xóa token thì gọi luôn
        // authService.logout();
        localStorage.removeItem("jwt_token");
        setUser(null);
        setLoading(false);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, logout, refreshUser }),
        [user, loading, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
