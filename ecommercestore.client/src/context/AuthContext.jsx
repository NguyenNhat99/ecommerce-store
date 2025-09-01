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
    // Rehydrate để tránh flicker
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem("auth_user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    const persistUser = (u) => {
        if (u) localStorage.setItem("auth_user", JSON.stringify(u));
        else localStorage.removeItem("auth_user");
    };

    const refreshUser = useCallback(async () => {
        try {
            const me = await authService.getCurrentUser();  // GET /accounts/auth/GetUser
            setUser(me || null);
            persistUser(me || null);
        } catch {
            setUser(null);
            persistUser(null);
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
        // service đã xóa token + reload; nếu không muốn reload, có thể tự xử lý:
        // authService.logout() // sẽ reload
        localStorage.removeItem("jwt_token");
        setUser(null);
        persistUser(null);
        setLoading(false);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, logout, refreshUser }),
        [user, loading, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
