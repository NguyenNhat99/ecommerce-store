export const ROUTERS = {
    USER: {
        HOME: "/",
        SHOP: "/cua-hang",
        PRODUCT_DETAIL: "/chi-tiet/:id",
        CONTACT: "/lien-he",
        CART: "/gio-hang",
        CHECKOUT: "/thanh-toan",
        CHECKOUTSUCCESS: "/dat-hang-thanh-cong",
        PAYMENT: "/payment/vnpay-return",
        CATEGORY: "/danh-muc/:id",
        PROFILE: "/thong-tin",
        CHANGE_PASSWORD: "/doi-mat-khau",
<<<<<<< HEAD
        ORDERS: "/don-hang",
        ORDERDETAIL: "/don-hang/:id",
=======
        BLOG_LIST: "/bai-viet",
        BLOG_DETAIL: "/chi-tiet-bai-viet/:id",
>>>>>>> a2a6b94c0a624ec2929ca6f7c6d7a0a0330082bd
    },
    AUTH: {
        LOGIN: "dang-nhap",
        REGISTER: "dang-ky-tai-khoan",
        FORGOTPASSWORD: "quen-mat-khau",
        RESSETPASSWORD: "reset-password",
        NOTAUTH: "khong-quyen-truy-cap",
    },
    ADMIN: {
        DASHBOARD: "admin/dashboard",
        UPDATEPRODUCT: "admin/san-pham/sua/:id",
        LISTPRODUCT: "admin/san-pham",
        INSERTPRODUCT: "admin/them-san-pham",
        BRANDS: "admin/thuong-hieu",
        CATEGORIES: "admin/loai-san-pham",
        PROFILE: "admin/thong-tin-ca-nhan",
        ACCOUNTS: "admin/quan-ly-tai-khoan",
        ACCOUNT_DETAIL: "admin/quan-ly-tai-khoan/chi-tiet/:email",
        ORDERS: "admin/quan-ly-don-hang",
        ORDERDETAIL: "admin/quan-ly-don-hang/chi-tiet/:id",
        REVENUE: "admin/quan-ly-doanh-thu",
    },
};
