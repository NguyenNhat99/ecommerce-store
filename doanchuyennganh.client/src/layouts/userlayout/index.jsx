import React, { lazy } from "react";

const Header = lazy(() => import('./header'));
const Footer = lazy(() => import('./footer'));
const UserLayout = ({ children, ...props }) => {
    return (
        <div {...props} style={{ overflowX: 'hidden', height: '100vh' }}>
            <Header />
            {children}
            <Footer />
        </div>
    );
};
export default UserLayout;
