import { lazy, Suspense } from 'react';
import { Route, Routes } from "react-router";
import { ROUTERS } from "./utils/router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
const Homepage = lazy(() => import("./page/user/homepage"));
const LoginPage = lazy(() => import("./page/auth/login"));
const Dashboard = lazy(() => import("./page/admin/dashboard"));
const userlayout = lazy(() => import("./layouts/userlayout"));
const adminlayout = lazy(() => import("./layouts/adminlayout"));

const ROUTES_CONFIG = [
    {
        path: ROUTERS.USER.HOME,
        component: <Homepage />,
        layout: userlayout,
    },
    {
        path: ROUTERS.AUTH.LOGIN,
        component: <LoginPage />,
    },
    {
        path: ROUTERS.ADMIN.DASHBOARD,
        component: <Dashboard />,
        layout: adminlayout,
        roles: ["Admin", "Staff"],
    }
];


const renderUserRouter = () => {
    return (
        <Routes>
            {ROUTES_CONFIG.map(({ path, component, layout: Layout, roles }, index) => {
                let element = component;

                if (roles) {
                    element = <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>;
                }

                if (Layout) {
                    element = <Layout>{element}</Layout>;
                }

                return <Route key={index} path={path} element={element} />;
            })}
        </Routes>
    );
};

const RouterCustom = () => {
    return (
        //<Suspense fallback={<Loading />}>
        //    {renderUserRouter()}
        //</Suspense>
        renderUserRouter()
    );
};
export default RouterCustom;
