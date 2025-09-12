export const ROUTERS = {
    USER: {
        HOME: "/",
        SHOP: "/cua-hang",
        PRODUCT_DETAIL: "/chi-tiet/:id",
        CONTACT: "/lien-he",
        CART: "/gio-hang",
        CHECKOUT: "/thanh-toan",
<<<<<<< HEAD
        CHECKOUTSUCCESS: "/dat-hang-thanh-cong",
        PAYMENT: "/payment/vnpay-return"
=======
        CATEGORY: "/danh-muc/:id",
        PROFILE: "/thong-tin",
        CHANGE_PASSWORD: "/doi-mat-khau",
>>>>>>> 425bf63bcc860173941ee01b9843fdb3b8e79e11
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
    },
};
