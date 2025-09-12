import { lazy, Suspense } from 'react';
import { Route, Routes } from "react-router";
import { ROUTERS } from "./utils/router";
import ProtectedRoute from "./components/auth/ProtectedRoute";

//layout 
const userlayout = lazy(() => import("./layouts/user/index"));
const adminlayout = lazy(() => import("./layouts/admin/index"));

//page user
const Homepage = lazy(() => import("./pages/user/home"));
const ProductPage = lazy(() => import("./pages/user/product"));
const ProductDetail = lazy(() => import("./pages/user/productdetail"));
const ContactPage = lazy(() => import("./pages/user/contact"));
const CartPage = lazy(() => import("./pages/user/cart"));
const CheckoutPage = lazy(() => import("./pages/user/checkout"));
const CheckoutSuccess = lazy(() => import("./pages/user/checkoutSuccess"));
const VnPayReturn = lazy(() => import("./pages/user/VnPayReturn"));

//page admin
import Dashboard from "./pages/admin/Dashboard";
import Buttons from "./pages/admin/Buttons";
import Badges from "./pages/admin/Badges";
import Tables from "./pages/admin/Tables";
import SocialButtons from "./pages/admin/SocialButtons";
import Cards from "./pages/admin/Cards";
import Alerts from "./pages/admin/Alerts";
import ProgressBars from "./pages/admin/ProgressBars";
import Modals from "./pages/admin/Modals";
import Grids from "./pages/admin/Grids";
import Typography from "./pages/admin/Typography";
import BasicForm from "./pages/admin/BasicForm";
import AdvancedForm from "./pages/admin/AdvancedForm";
import Icons from "./pages/admin/Icons";
import Widgets from "./pages/admin/Widgets";
import Chartjs from "./pages/admin/Chartjs";
import Recharts from "./pages/admin/Recharts";
import GoogleMaps from "./pages/admin/GoogleMaps";

const Brands = lazy(() => import("./pages/admin/brands"));
const Categories = lazy(() => import("./pages/admin/categories"));
const ListProduct = lazy(() => import("./pages/admin/products/ListProduct"));
const InsertProduct = lazy(() => import("./pages/admin/products/InsertProduct"));
const UpdateProduct = lazy(() => import("./pages/admin/products/UpdateProduct"));
const Profile = lazy(() => import("./pages/admin/profile/index"));
const Accounts = lazy(() => import("./pages/admin/accounts/index"));
const DetailAccount = lazy(() => import("./pages/admin/accounts/detailAccount"));
const OrderPage = lazy(() => import("./pages/admin/orders/index"));
const OrderDetail = lazy(() => import("./pages/admin/orders/detail"));

//auth page
const Login = lazy(() => import("./pages/auth/login"));
const Register = lazy(() => import("./pages/auth/register"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotPassword"));
const RessetPassword = lazy(() => import("./pages/auth/resetPassword"));

const ROUTES_CONFIG = [
    { path: ROUTERS.AUTH.LOGIN, component: <Login /> },
    { path: ROUTERS.AUTH.REGISTER, component: <Register /> },
    { path: ROUTERS.AUTH.FORGOTPASSWORD, component: <ForgotPassword /> },
    { path: ROUTERS.AUTH.RESSETPASSWORD, component: <RessetPassword /> },
    {path: ROUTERS.USER.HOME,component: <Homepage />,layout: userlayout},
    {path: ROUTERS.USER.SHOP,component: <ProductPage />,layout: userlayout},
    {path: ROUTERS.USER.PRODUCT_DETAIL,component: <ProductDetail />,layout: userlayout,},
    {path: ROUTERS.USER.CONTACT,component: <ContactPage />,layout: userlayout,},
    {path: ROUTERS.USER.CART,component: <CartPage />,layout: userlayout,},
    { path: ROUTERS.USER.CHECKOUT, component: <CheckoutPage />, layout: userlayout, },
    { path: ROUTERS.USER.CHECKOUTSUCCESS, component: <CheckoutSuccess />, layout: userlayout, },
    { path: ROUTERS.USER.PAYMENT, component: <VnPayReturn />, layout: userlayout, },
    { path: ROUTERS.ADMIN.DASHBOARD, component: <Dashboard />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.BRANDS, component: <Brands />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.CATEGORIES, component: <Categories />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.LISTPRODUCT, component: <ListProduct />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.INSERTPRODUCT, component: <InsertProduct />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.UPDATEPRODUCT, component: <UpdateProduct />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.PROFILE, component: <Profile />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.ACCOUNTS, component: <Accounts />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.ACCOUNT_DETAIL, component: <DetailAccount />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.ORDERS, component: <OrderPage />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.ORDERDETAIL, component: <OrderDetail />, layout: adminlayout, },
    {
        path: "/components/buttons",
        component: <Buttons />, layout: adminlayout
    },
    {
        path: "/components/badges",
        component: <Badges />, layout: adminlayout
    },
    {
        path: "/components/socials",
        component: <SocialButtons />, layout: adminlayout
    },
    {
        path: "/components/cards",
        component: <Cards />, layout: adminlayout
    },
    {
        path: "/components/alerts",
        component: <Alerts />, layout: adminlayout
    },
    {
        path: "/components/progressbars",
        component: <ProgressBars />, layout: adminlayout
    },
    {
        path: "/components/modals",
        component: <Modals />, layout: adminlayout
    },
    {
        path: "/components/grids",
        component: <Grids />, layout: adminlayout
    },
    {
        path: "/components/typography",
        component: <Typography />, layout: adminlayout
    },
    {
        path: "/tables",
        component: <Tables />, layout: adminlayout
    },
    {
        path: "/forms/basic-form",
        component: <BasicForm />, layout: adminlayout
    },
    {
        path: "/forms/advanced-form",
        component: <AdvancedForm />, layout: adminlayout
    },
    {
        path: "/icons",
        component: <Icons />, layout: adminlayout
    },
   
   
   
    {
        path: "/widgets",
        component: Widgets, layout: adminlayout
    },
    {
        path: "/charts/chartjs",
        component: Chartjs, layout: adminlayout
    },
    {
        path: "/charts/recharts",
        component: Recharts, layout: adminlayout
    },
    {
        path: "/maps/google-map",
        component: GoogleMaps, layout: adminlayout
    },

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
        <Suspense fallback={<div>loading..</div>}>
            {renderUserRouter()}
        </Suspense>
        //renderUserRouter()
    );
};
export default RouterCustom;