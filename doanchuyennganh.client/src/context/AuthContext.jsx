import { createContext, useState, useEffect, useMemo } from "react";
import authService from "../service/authService";

const AuthContext = createContext(null); //Giá trị mặc định là null

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Flag để tránh memory leak
        let isMounted = true; 

        const loadUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                if (isMounted) {
                    setUser(userData);
                }
            } catch (error) {
                console.error("Lỗi khi lấy user:", error);
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            // Cleanup khi component unmount
            isMounted = false; 
        };
    }, []);

    const signIn = async ({ email, password }) => {
        try {
            const token = await authService.login(email, password);
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
        }
    };
    const signOut = () => {
        authService.logout();
        setUser(null);
    };
    const contextValue = useMemo(
        () => ({
            user,
            loading,
            signIn,
            signOut,
        }),
        [user, loading],
    );
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
