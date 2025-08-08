export const ROUTERS = {
    USER: {
        HOME: ""
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
        INSERTPRODUCT: "admin/san-pham/them",
        BRANDS: "admin/thuong-hieu",
        CATEGORIES: "admin/loai-san-pham",
        PROFILE: "admin/thong-tin-ca-nhan",
        ACCOUNTS: "admin/quan-ly-tai-khoan",
        ACCOUNT_DETAIL: "admin/quan-ly-tai-khoan/chi-tiet/:email", // hoặc .../:id nếu muốn dùng id
    },
};
