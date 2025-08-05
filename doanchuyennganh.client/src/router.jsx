import { lazy, Suspense } from 'react';
import { Route, Routes } from "react-router";
import { ROUTERS } from "./utils/router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
//layout 
const userlayout = lazy(() => import("./layouts/userlayout"));
const adminlayout = lazy(() => import("./layouts/adminlayout"));

//page auth
const Login = lazy(() => import("./page/auth/login"));
const Register = lazy(() => import("./page/auth/Register"));
const ForgotPassword = lazy(() => import("./page/auth/ForgotPassword"));

//page user
const Homepage = lazy(() => import("./page/user/homepage"));

//page admin
const Dashboard = lazy(() => import("./page/admin/dashboard"));
const InsertProduct = lazy(() => import("./page/admin/products/InsertProduct"));
const UpdateProduct = lazy(() => import("./page/admin/products/UpdateProduct"));
const ListProduct = lazy(() => import("./page/admin/products/ListProduct"));
const Brands = lazy(() => import("./page/admin/brands/Index"));
const Categories = lazy(() => import("./page/admin/categories/Index"));
const Profile = lazy(() => import("./page/admin/profile/index"));


const ROUTES_CONFIG = [
    {
        path: ROUTERS.AUTH.LOGIN,
        component: <Login />,
    },
    {
        path: ROUTERS.AUTH.REGISTER,
        component: <Register />,
    },
    {
        path: ROUTERS.AUTH.FORGOTPASSWORD,
        component: <ForgotPassword />,
    },
    {
        path: ROUTERS.USER.HOME,
        component: <Homepage />,
        layout: userlayout,
    },
    {
        path: ROUTERS.ADMIN.DASHBOARD,
        component: <Dashboard />,
        layout: adminlayout
    },
    {
        path: ROUTERS.ADMIN.INSERTPRODUCT,
        component: <InsertProduct />,
        layout: adminlayout
    },
    {
        path: ROUTERS.ADMIN.UPDATEPRODUCT,
        component: <UpdateProduct />,
        layout: adminlayout
    },
    {
        path: ROUTERS.ADMIN.LISTPRODUCT,
        component: <ListProduct />,
        layout: adminlayout
    },
    {
        path: ROUTERS.ADMIN.BRANDS,
        component: <Brands />,
        layout: adminlayout
    },
    {
        path: ROUTERS.ADMIN.CATEGORIES,
        component: <Categories />,
        layout: adminlayout
    }
    ,
    {
        path: ROUTERS.ADMIN.PROFILE,
        component: <Profile />,
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
