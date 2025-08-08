import { lazy, Suspense } from 'react';
import { Route, Routes } from "react-router";
import { ROUTERS } from "./utils/router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Loading from "../src/components/Loading/index"
//layout 
const userlayout = lazy(() => import("./layouts/userlayout"));
const adminlayout = lazy(() => import("./layouts/adminlayout"));

//page auth
const Login = lazy(() => import("./page/auth/login"));
const Register = lazy(() => import("./page/auth/Register"));
const ForgotPassword = lazy(() => import("./page/auth/ForgotPassword"));
const RessetPassword = lazy(() => import("./page/auth/ResetPassword"));


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
const ListAccount = lazy(() => import("./page/admin/accounts/ListAccount"));
const DetailAccount = lazy(() => import("./page/admin/accounts/DetailAccount"));


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
        path: ROUTERS.AUTH.RESSETPASSWORD,
        component: <RessetPassword />,
    },
    {
        path: ROUTERS.USER.HOME,
        component: <Homepage />,
        layout: userlayout,
    },
    {
        path: ROUTERS.ADMIN.DASHBOARD,
        component: <Dashboard />,
        layout: adminlayout,
        roles: ["Admin","Staff"]
    },
    {
        path: ROUTERS.ADMIN.INSERTPRODUCT,
        component: <InsertProduct />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    },
    {
        path: ROUTERS.ADMIN.UPDATEPRODUCT,
        component: <UpdateProduct />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    },
    {
        path: ROUTERS.ADMIN.LISTPRODUCT,
        component: <ListProduct />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    },
    {
        path: ROUTERS.ADMIN.BRANDS,
        component: <Brands />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    },
    {
        path: ROUTERS.ADMIN.CATEGORIES,
        component: <Categories />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    },
    {
        path: ROUTERS.ADMIN.PROFILE,
        component: <Profile />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    }
    ,
    {
        path: ROUTERS.ADMIN.ACCOUNTS,
        component: <ListAccount />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    }
    ,
    {
        path: ROUTERS.ADMIN.ACCOUNT_DETAIL,
        component: <DetailAccount />,
        layout: adminlayout,
        roles: ["Admin", "Staff"]
    }
];


const renderUserRouter = () => {
    return (
        <Routes>
            {ROUTES_CONFIG.map(({ path, component, layout: Layout, roles }, index) => {
                let element = component;

                if (Layout) {
                    element = <Layout>{element}</Layout>;
                }

                if (roles) {
                    element = <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>;
                }

                return <Route key={index} path={path} element={element} />;
            })}
        </Routes>
    );
};

const RouterCustom = () => {
    return (
        <Suspense fallback={<Loading />}>
            {renderUserRouter()}
        </Suspense>
        //renderUserRouter()
    );
};
export default RouterCustom;
