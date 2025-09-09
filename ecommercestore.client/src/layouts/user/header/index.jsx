import React, { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import CategoryMenu from "../../../components/common/CategoryMenu";
import HeroCarousel from "../../../components/common/HeroCarousel";
import AuthContext from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";

// Placeholder cố định kích thước để tránh CLS khi đang loading
const AuthSlotSkeleton = () => (
    <div
        className="d-flex align-items-center"
        style={{ width: 200, height: 40, justifyContent: "flex-end" }}
        aria-hidden="true"
    >
        <div
            style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,.08)",
            }}
        />
        <div
            style={{
                width: 110,
                height: 14,
                marginLeft: 8,
                borderRadius: 4,
                background: "rgba(0,0,0,.08)",
            }}
        />
    </div>
);

const Header = () => {
    const location = useLocation();
    const { pathname } = useLocation();
    const { user, logout, loading } = useContext(AuthContext); // lấy loading từ context
    const isHome = pathname === "/";
    const { cartQty } = useCart();

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const initials = useMemo(() => {
        if (!user) return "";
        const name =
            user.fullName ||
            `${user.lastName || ""} ${user.firstName || ""}` ||
            user.userName ||
            "";
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("");
    }, [user]);

    return (
        <>
            {/* Topbar */}
            <div className="container-fluid">
                <div className="row bg-secondary py-2 px-xl-5">
                    <div className="col-lg-6 d-none d-lg-block">
                        <div className="d-inline-flex align-items-center">
                            <Link className="text-dark" to="/">
                                Câu hỏi thường gặp
                            </Link>
                            <span className="text-muted px-2">|</span>
                            <Link className="text-dark" to="/">
                                Trợ giúp
                            </Link>
                            <span className="text-muted px-2">|</span>
                            <Link className="text-dark" to="/">
                                Hỗ trợ
                            </Link>
                        </div>
                    </div>
                    <div className="col-lg-6 text-center text-lg-right">
                        <div className="d-inline-flex align-items-center">
                            <a className="text-dark px-2" href="#!">
                                <i className="fab fa-facebook-f" />
                            </a>
                            <a className="text-dark px-2" href="#!">
                                <i className="fab fa-twitter" />
                            </a>
                            <a className="text-dark px-2" href="#!">
                                <i className="fab fa-linkedin-in" />
                            </a>
                            <a className="text-dark px-2" href="#!">
                                <i className="fab fa-instagram" />
                            </a>
                            <a className="text-dark pl-2" href="#!">
                                <i className="fab fa-youtube" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Logo + Search + Icons */}
                <div className="row align-items-center py-3 px-xl-5">
                    <div className="col-lg-3 d-none d-lg-block">
                        <Link to="/" className="text-decoration-none">
                            <h1 className="m-0 display-5 font-weight-semi-bold">
                                <span className="text-primary font-weight-bold border px-3 mr-1">
                                    E
                                </span>
                                Shopper
                            </h1>
                        </Link>
                    </div>

                    <div className="col-lg-6 col-6 text-left">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm sản phẩm..."
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text bg-transparent text-primary">
                                        <i className="fa fa-search" />
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="col-lg-3 col-6 text-right">
                        <Link to="/gio-hang" className="btn border position-relative">
                            <i className="fas fa-shopping-cart text-primary" />
                            <span
                                className="badge badge-primary position-absolute"
                                style={{ top: "-8px", right: "-8px" }}
                            >
                                {cartQty}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <div className="container-fluid mb-0">
                <div className="row border-top px-xl-5">
                    <CategoryMenu />
                    <div className="col-lg-9">
                        <nav className="navbar navbar-expand-lg bg-light navbar-light py-5 py-lg-0 px-0">
                            <Link to="/" className="text-decoration-none d-block d-lg-none">
                                <h1 className="m-0 display-5 font-weight-semi-bold">
                                    <span className="text-primary font-weight-bold border px-3 mr-1">
                                        E
                                    </span>
                                    Shopper
                                </h1>
                            </Link>
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarCollapse"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>

                            <div
                                className="collapse navbar-collapse justify-content-between"
                                id="navbarCollapse"
                            >
                                <div className="navbar-nav mr-auto py-0">
                                    <Link
                                        to="/"
                                        className={`nav-item nav-link ${isActive("/", true) ? "active" : ""
                                            }`}
                                    >
                                        Trang chủ
                                    </Link>
                                    <Link
                                        to="/cua-hang"
                                        className={`nav-item nav-link ${isActive("/cua-hang") ? "active" : ""
                                            }`}
                                    >
                                        Cửa hàng
                                    </Link>
                                    <Link
                                        to="/gio-hang"
                                        className={`nav-item nav-link ${isActive("/gio-hang") ? "active" : ""
                                            }`}
                                    >
                                        Giỏ hàng
                                    </Link>
                                    <Link
                                        to="/thanh-toan"
                                        className={`nav-item nav-link ${isActive("/thanh-toan") ? "active" : ""
                                            }`}
                                    >
                                        Thanh toán
                                    </Link>
                                    <Link
                                        to="/lien-he"
                                        className={`nav-item nav-link ${isActive("/lien-he") ? "active" : ""
                                            }`}
                                    >
                                        Liên hệ
                                    </Link>
                                </div>

                                {/* Khe auth có minWidth để tránh co/giãn */}
                                <div className="navbar-nav ml-auto py-0" style={{ minWidth: 200 }}>
                                    {loading ? (
                                        <AuthSlotSkeleton />
                                    ) : !user ? (
                                        <>
                                            <Link
                                                to="/dang-nhap"
                                                className={`nav-item nav-link ${isActive("/dang-nhap") ? "active" : ""
                                                    }`}
                                            >
                                                Đăng nhập
                                            </Link>
                                            <Link
                                                to="/dang-ky-tai-khoan"
                                                className={`nav-item nav-link ${isActive("/dang-ky-tai-khoan") ? "active" : ""
                                                    }`}
                                            >
                                                Đăng ký
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="nav-item dropdown" style={{ minWidth: 180 }}>
                                            <a
                                                href="#!"
                                                className="nav-link dropdown-toggle d-flex align-items-center"
                                                id="userDropdown"
                                                role="button"
                                                data-bs-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="false"
                                                style={{ gap: 8 }}
                                            >
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt="avatar"
                                                        width={28}
                                                        height={28}
                                                        style={{
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            background: "rgba(0,0,0,.03)",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: "50%",
                                                            background: "#0d6efd",
                                                            color: "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 600,
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        {initials || "U"}
                                                    </div>
                                                    )}
                                                <span className="ml-2">{user.firstName} {user.lastName}</span>
                                            </a>

                                            <div
                                                className="dropdown-menu dropdown-menu-right"
                                                aria-labelledby="userDropdown"
                                            >
                                                <Link className="dropdown-item" to="/thong-tin">
                                                    Thông tin
                                                </Link>
                                                <Link className="dropdown-item" to="/don-hang">
                                                    Đơn hàng đã mua
                                                </Link>
                                                <div className="dropdown-divider"></div>
                                                    <button
                                                        className="dropdown-item"
                                                        type="button"
                                                        onClick={() => {
                                                            logout();
                                                            window.location.href = "/";
                                                        }}
                                                    >
                                                        Đăng xuất
                                                    </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </nav>
                        {isHome && <HeroCarousel />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
