import React, { Suspense, lazy, useEffect } from "react";
import BackToTop from "../../components/common/BackToTop";
const Header = lazy(() => import("./header"));
const Footer = lazy(() => import("./footer"));
import "./index.css"

export default function UserLayout({ children, ...props }) {
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "../../public/css/user.bundle.css";
        link.dataset.userCss = "true";
        document.head.appendChild(link);
        return () => {
            const el = document.head.querySelector('link[data-user-css="true"]');
            if (el) el.remove();
        };
    }, []);

    return (
        <div className="user-root">
            <div {...props} style={{ overflowX: "hidden" }}>
                <Suspense fallback={<div>Đang tải header...</div>}><Header /></Suspense>
                {children}
                <BackToTop />
                <Suspense fallback={<div>Đang tải footer...</div>}><Footer /></Suspense>
            </div>
        </div>
    );
}
