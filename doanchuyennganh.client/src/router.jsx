import { lazy, Suspense } from 'react';
import { Route, Routes } from "react-router";
import { ROUTERS } from "./utils/router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
//layout 
const userlayout = lazy(() => import("./layouts/userlayout"));
const adminlayout = lazy(() => import("./layouts/adminlayout"));

//page user
const Homepage = lazy(() => import("./page/user/homepage"));
const LoginPage = lazy(() => import("./page/auth/login"));

//page admin
const Dashboard = lazy(() => import("./page/admin/dashboard"));
const InsertProduct = lazy(() => import("./page/admin/products/InsertProduct"));
const UpdateProduct = lazy(() => import("./page/admin/products/UpdateProduct"));
const ListProduct = lazy(() => import("./page/admin/products/ListProduct"));


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
        layout: adminlayout
    }
    ,
    {
        path: ROUTERS.ADMIN.INSERTPRODUCT,
        component: <InsertProduct />,
        layout: adminlayout
    }
    ,
    {
        path: ROUTERS.ADMIN.UPDATEPRODUCT,
        component: <UpdateProduct />,
        layout: adminlayout
    }
    ,
    {
        path: ROUTERS.ADMIN.LISTPRODUCT,
        component: <ListProduct />,
        layout: adminlayout
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
