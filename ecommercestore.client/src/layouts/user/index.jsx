import React, { Suspense, lazy, useEffect, useState } from "react";
import BackToTop from "../../components/common/BackToTop";
const Header = lazy(() => import("./header"));
const Footer = lazy(() => import("./footer"));

export default function UserLayout({ children, ...props }) {
    const [cssReady, setCssReady] = useState(false);

    useEffect(() => {
        const HREF = "/eshopper-ui/css/user.bundle.css";

        let link = document.querySelector('link[data-user-css="true"]');
        if (link && link.getAttribute("data-loaded") === "1") {
            setCssReady(true);
            return () => { };
        }

        if (!link) {
            link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = HREF;
            link.dataset.userCss = "true";

            link.media = "print";
            link.onload = () => {
                link.media = "all";
                link.setAttribute("data-loaded", "1");
                setCssReady(true);
            };

            link.onerror = () => {
                console.error("Không tải được user.bundle.css:", HREF);
                setCssReady(true);
            };

            document.head.appendChild(link);
        } else {
            link.onload = () => {
                link.setAttribute("data-loaded", "1");
                setCssReady(true);
            };
        }

        return () => {
            const l = document.querySelector('link[data-user-css="true"]');
            if (l) l.remove();
        };
    }, []);

    if (!cssReady) {
        return <div style={{ minHeight: "50vh" }} />;
    }

    return (
        <div className="user-root" {...props} style={{ overflowX: "hidden" }}>
            <Suspense fallback={<div>Đang tải header...</div>}><Header /></Suspense>
            {children}
            <BackToTop />
            <Suspense fallback={<div>Đang tải footer...</div>}><Footer /></Suspense>
        </div>
    );
}
