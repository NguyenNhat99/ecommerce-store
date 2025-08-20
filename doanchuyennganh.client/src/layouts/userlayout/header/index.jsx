import React from 'react';
import { Link } from 'react-router-dom';
import DropdownHover from "../../../components/common/DropdownHover";
import CategoryMenu from "../../../components/common/CategoryMenu";
import HeroCarousel from "../../../components/common/HeroCarousel";

const Header = () => {
    return (
        <>
            {/* Topbar */}
            <div className="container-fluid">
                <div className="row bg-secondary py-2 px-xl-5">
                    <div className="col-lg-6 d-none d-lg-block">
                        <div className="d-inline-flex align-items-center">
                            <Link className="text-dark" to="/">Câu hỏi thường gặp</Link>
                            <span className="text-muted px-2">|</span>
                            <Link className="text-dark" to="/">Trợ giúp</Link>
                            <span className="text-muted px-2">|</span>
                            <Link className="text-dark" to="/">Hỗ trợ</Link>
                        </div>
                    </div>
                    <div className="col-lg-6 text-center text-lg-right">
                        <div className="d-inline-flex align-items-center">
                            <a className="text-dark px-2" href="#"><i className="fab fa-facebook-f"></i></a>
                            <a className="text-dark px-2" href="#"><i className="fab fa-twitter"></i></a>
                            <a className="text-dark px-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                            <a className="text-dark px-2" href="#"><i className="fab fa-instagram"></i></a>
                            <a className="text-dark pl-2" href="#"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>
                </div>

                {/* Logo + Search + Icons */}
                <div className="row align-items-center py-3 px-xl-5">
                    <div className="col-lg-3 d-none d-lg-block">
                        <Link to="/" className="text-decoration-none">
                            <h1 className="m-0 display-5 font-weight-semi-bold">
                                <span className="text-primary font-weight-bold border px-3 mr-1">E</span>Shopper
                            </h1>
                        </Link>
                    </div>

                    <div className="col-lg-6 col-6 text-left">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Tìm sản phẩm..." />
                                <div className="input-group-append">
                                    <span className="input-group-text bg-transparent text-primary">
                                        <i className="fa fa-search"></i>
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="col-lg-3 col-6 text-right">
                        <Link to="/wishlist" className="btn border">
                            <i className="fas fa-heart text-primary"></i>
                            <span style={{ marginLeft: '4px' }}>0</span>
                        </Link>
                        <Link to="/cart" className="btn border">
                            <i className="fas fa-shopping-cart text-primary"></i>
                            <span style={{ marginLeft: '4px' }}>0</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <div className="container-fluid mb-5">
                <div className="row border-top px-xl-5">
                    <CategoryMenu />
                    <div className="col-lg-9">
                        <nav className="navbar navbar-expand-lg bg-light navbar-light py-3 py-lg-0 px-0">
                            <Link to="/" className="text-decoration-none d-block d-lg-none">
                                <h1 className="m-0 display-5 font-weight-semi-bold">
                                    <span className="text-primary font-weight-bold border px-3 mr-1">E</span>Shopper
                                </h1>
                            </Link>
                            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse">
                                <span className="navbar-toggler-icon"></span>
                            </button>

                            <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
                                <div className="navbar-nav mr-auto py-0">
                                    <Link to="/" className="nav-item nav-link">Trang chủ</Link>
                                    <Link to="/shop" className="nav-item nav-link">Cửa hàng</Link>
                                    <Link to="/detail" className="nav-item nav-link">Chi tiết</Link>
                                    <DropdownHover
                                        title="Trang"
                                        items={[
                                            { to: "/cart", label: "Giỏ hàng" },
                                            { to: "/checkout", label: "Thanh toán" }
                                        ]}
                                    />
                                    <Link to="/contact" className="nav-item nav-link">Liên hệ</Link>
                                </div>

                                <div className="navbar-nav ml-auto py-0">
                                    <Link to="/login" className="nav-item nav-link">Đăng nhập</Link>
                                    <Link to="/register" className="nav-item nav-link">Đăng ký</Link>
                                </div>
                            </div>
                        </nav>
                        <HeroCarousel />
                    </div>
                </div>
            </div>
        </>
    );
}
export default Header;