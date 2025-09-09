import React, { Suspense, lazy } from "react";
import BackToTop from "../../components/common/BackToTop";

const Header = lazy(() => import('./header'));
const Footer = lazy(() => import('./footer'));

const UserLayout = ({ children, ...props }) => {
    return (
        <div {...props} style={{ overflowX: 'hidden' }}>
            <Suspense fallback={<div>Đang tải header...</div>}>
                <Header />
            </Suspense>

            {children}

            <BackToTop />
            <Suspense fallback={<div>Đang tải footer...</div>}>
                <Footer />
            </Suspense>
        </div>
    );
};

export default UserLayout;