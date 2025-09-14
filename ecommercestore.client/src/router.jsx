import { lazy, Suspense } from 'react';
import { Route, Routes } from "react-router";
import { ROUTERS } from "./utils/router";
import ProtectedRoute from "./components/auth/ProtectedRoute";

//layout 
const userlayout = lazy(() => import("./layouts/user/index"));
const adminlayout = lazy(() => import("./layouts/admin/index"));

//page user
const Homepage = lazy(() => import("./pages/user/home"));
const ProductPage = lazy(() => import("./pages/user/product/product"));
const ProductDetail = lazy(() => import("./pages/user/product/ProductDetail"));
const ContactPage = lazy(() => import("./pages/user/contact"));
const CartPage = lazy(() => import("./pages/user/cart"));
const CheckoutPage = lazy(() => import("./pages/user/checkout"));
const CheckoutSuccess = lazy(() => import("./pages/user/checkoutSuccess"));
const VnPayReturn = lazy(() => import("./pages/user/VnPayReturn"));
const CategoryPage = lazy(() => import("./pages/user/category"));
const ProfilePage = lazy(() => import("./pages/user/profile"));
const ChangePassword = lazy(() => import("./pages/user/changepassword"));
const OrdersHistory = lazy(() => import("./pages/user/orderhistory"));
const DetailOrder = lazy(() => import("./pages/user/orderdetail"));
const BlogList = lazy(() => import("./pages/user/blog/BlogList"));
const BlogDetail = lazy(() => import("./pages/user/blog/BlogDetail"));

//page admin
import Dashboard from "./pages/admin/Dashboard";

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
const Revenue = lazy(() => import("./pages/admin/revenue/index"));
const Article = lazy(() => import("./pages/admin/articles/index"));
const InsertArticle = lazy(() => import("./pages/admin/articles/InsertArticles"));
const UpdateBlog = lazy(() => import("./pages/admin/articles/UpdateArticle"));

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
    { path: ROUTERS.USER.CATEGORY, component: <CategoryPage />, layout: userlayout, },
    { path: ROUTERS.USER.PROFILE, component: <ProfilePage />, layout: userlayout, },
    { path: ROUTERS.USER.CHANGE_PASSWORD, component: <ChangePassword />, layout: userlayout, },
    { path: ROUTERS.USER.ORDERS, component: <OrdersHistory />, layout: userlayout, },
    { path: ROUTERS.USER.ORDERDETAIL, component: <DetailOrder />, layout: userlayout, },
    { path: ROUTERS.USER.BLOG_LIST, component: <BlogList />, layout: userlayout },
    { path: ROUTERS.USER.BLOG_DETAIL, component: <BlogDetail />, layout: userlayout },
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
    { path: ROUTERS.ADMIN.REVENUE, component: <Revenue />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.BLOG, component: <Article />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.INSERTBLOG, component: <InsertArticle />, layout: adminlayout, },
    { path: ROUTERS.ADMIN.UPDATEBLOG, component: <UpdateBlog />, layout: adminlayout, },
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