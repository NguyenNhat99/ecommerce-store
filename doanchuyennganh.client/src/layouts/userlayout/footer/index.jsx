import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <div className="container-fluid bg-secondary text-dark mt-5 pt-5">
            <div className="row px-xl-5 pt-5">
                <div className="col-lg-4 col-md-12 mb-5 pr-3 pr-xl-5">
                    <Link to="/" className="text-decoration-none">
                        <h1 className="mb-4 display-5 font-weight-semi-bold">
                            <span className="text-primary font-weight-bold border border-white px-3 mr-1">E</span>Shopper
                        </h1>
                    </Link>
                    <p>Chúng tôi cung cấp sản phẩm thời trang chất lượng với dịch vụ tận tâm.</p>
                    <p className="mb-2"><i className="fa fa-map-marker-alt text-primary mr-3"></i>123 Đường, Thành phố, Việt Nam</p>
                    <p className="mb-2"><i className="fa fa-envelope text-primary mr-3"></i>info@example.com</p>
                    <p className="mb-0"><i className="fa fa-phone-alt text-primary mr-3"></i>+84 012 345 678</p>
                </div>

                <div className="col-lg-8 col-md-12">
                    <div className="row">
                        <div className="col-md-4 mb-5">
                            <h5 className="font-weight-bold text-dark mb-4">Liên kết nhanh</h5>
                            <div className="d-flex flex-column justify-content-start">
                                <Link className="text-dark mb-2" to="/"><i className="fa fa-angle-right mr-2"></i>Trang chủ</Link>
                                <Link className="text-dark mb-2" to="/shop"><i className="fa fa-angle-right mr-2"></i>Cửa hàng</Link>
                                <Link className="text-dark mb-2" to="/detail"><i className="fa fa-angle-right mr-2"></i>Chi tiết</Link>
                                <Link className="text-dark mb-2" to="/cart"><i className="fa fa-angle-right mr-2"></i>Giỏ hàng</Link>
                                <Link className="text-dark" to="/contact"><i className="fa fa-angle-right mr-2"></i>Liên hệ</Link>
                            </div>
                        </div>

                        <div className="col-md-4 mb-5">
                            <h5 className="font-weight-bold text-dark mb-4">Danh mục</h5>
                            <div className="d-flex flex-column justify-content-start">
                                <Link className="text-dark mb-2" to="/category/men">Áo nam</Link>
                                <Link className="text-dark mb-2" to="/category/women">Áo nữ</Link>
                                <Link className="text-dark mb-2" to="/category/baby">Trẻ em</Link>
                                <Link className="text-dark" to="/category/shoes">Giày</Link>
                            </div>
                        </div>

                        <div className="col-md-4 mb-5">
                            <h5 className="font-weight-bold text-dark mb-4">Đăng ký nhận tin</h5>
                            <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký!'); }}>
                                <div className="form-group">
                                    <input type="text" className="form-control border-0 py-4" placeholder="Tên của bạn" required />
                                </div>
                                <div className="form-group">
                                    <input type="email" className="form-control border-0 py-4" placeholder="Email của bạn" required />
                                </div>
                                <div>
                                    <button className="btn btn-primary btn-block border-0 py-3" type="submit">Đăng ký</button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>

            <div className="row border-top border-light mx-xl-5 py-4">
                <div className="col-md-6 px-xl-0">
                    <p className="mb-md-0 text-center text-md-left text-dark">
                        &copy; <span className="text-dark font-weight-semi-bold">Shop của bạn</span>. Bảo lưu mọi quyền.
                    </p>
                </div>
                <div className="col-md-6 px-xl-0 text-center text-md-right">
                    <img className="img-fluid" src="/eshopper-ui/img/payments.png" alt="payments" />
                </div>
            </div>
        </div>
    );
}
export default Footer;