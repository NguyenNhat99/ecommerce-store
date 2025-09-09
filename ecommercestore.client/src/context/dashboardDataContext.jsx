import { createContext, useContext, useEffect, useState } from "react";

export const DashboardDataCreateContext = createContext();

export const DashboardDataProvider = ({ children }) => {
    const [sidebarMini, setSidebarMini] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isThemeDirection, setIsThemeDirection] = useState(false);

    useEffect(() => {
        if (isThemeDirection) {
            document
                .querySelector("body")
                .setAttribute("data-theme-direction", "rtl");
        } else {
            document
                .querySelector("body")
                .setAttribute("data-theme-direction", "ltr");
        }
    }, [isThemeDirection]);

    useEffect(() => {
        if (isDark) {
            document.querySelector("body").setAttribute("data-theme", "dark");
        } else {
            document.querySelector("body").setAttribute("data-theme", "light");
        }
    }, [isDark]);

    return (
        <DashboardDataCreateContext.Provider
            value={{
                sidebarMini,
                setSidebarMini,
                isDark,
                setIsDark,
                isThemeDirection,
                setIsThemeDirection,
            }}
        >
            {children}
        </DashboardDataCreateContext.Provider>
    );
};

export const useDashboardDataContext = () => {
    return useContext(DashboardDataCreateContext);
};

