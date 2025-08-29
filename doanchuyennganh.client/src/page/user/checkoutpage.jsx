export default function CheckoutPage() {
    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-3" >
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Thanh toán
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <a href="/">Trang chủ</a>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Thanh toán</p>
                    </div>
                </div>
            </div >

            <div className="container-fluid pt-5">
                <div className="row px-xl-5">
                    {/* Thông tin thanh toán */}
                    <div className="col-lg-8">
                        <div className="mb-4">
                            <h4 className="font-weight-semi-bold mb-4">Địa chỉ thanh toán</h4>
                            <div className="row">
                                <div className="col-md-6 form-group">
                                    <label>Họ</label>
                                    <input className="form-control" type="text" placeholder="Nguyễn" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Tên</label>
                                    <input className="form-control" type="text" placeholder="Văn A" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Email</label>
                                    <input className="form-control" type="email" placeholder="example@email.com" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Số điện thoại</label>
                                    <input className="form-control" type="text" placeholder="+84 123 456 789" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Địa chỉ 1</label>
                                    <input className="form-control" type="text" placeholder="123 Đường A" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Địa chỉ 2</label>
                                    <input className="form-control" type="text" placeholder="Phường B, Quận C" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Quốc gia</label>
                                    <select className="custom-select">
                                        <option selected>Việt Nam</option>
                                        <option>Mỹ</option>
                                        <option>Nhật Bản</option>
                                        <option>Hàn Quốc</option>
                                    </select>
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Thành phố</label>
                                    <input className="form-control" type="text" placeholder="Hà Nội" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Tỉnh/Thành</label>
                                    <input className="form-control" type="text" placeholder="Hà Nội" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Mã bưu điện</label>
                                    <input className="form-control" type="text" placeholder="100000" />
                                </div>
                                <div className="col-md-12 form-group">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="newaccount" />
                                        <label className="custom-control-label" htmlFor="newaccount">
                                            Tạo tài khoản mới
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-12 form-group">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="shipto" />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="shipto"
                                            data-toggle="collapse"
                                            data-target="#shipping-address"
                                        >
                                            Giao hàng đến địa chỉ khác
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ giao hàng (ẩn/hiện khi chọn) */}
                        <div className="collapse mb-4" id="shipping-address">
                            <h4 className="font-weight-semi-bold mb-4">Địa chỉ giao hàng</h4>
                            <div className="row">
                                <div className="col-md-6 form-group">
                                    <label>Họ</label>
                                    <input className="form-control" type="text" placeholder="Nguyễn" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Tên</label>
                                    <input className="form-control" type="text" placeholder="Văn B" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Email</label>
                                    <input className="form-control" type="email" placeholder="example@email.com" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Số điện thoại</label>
                                    <input className="form-control" type="text" placeholder="+84 987 654 321" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Địa chỉ 1</label>
                                    <input className="form-control" type="text" placeholder="456 Đường B" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Địa chỉ 2</label>
                                    <input className="form-control" type="text" placeholder="Phường C, Quận D" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Quốc gia</label>
                                    <select className="custom-select">
                                        <option selected>Việt Nam</option>
                                        <option>Mỹ</option>
                                        <option>Nhật Bản</option>
                                        <option>Hàn Quốc</option>
                                    </select>
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Thành phố</label>
                                    <input className="form-control" type="text" placeholder="TP.HCM" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Tỉnh/Thành</label>
                                    <input className="form-control" type="text" placeholder="TP.HCM" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Mã bưu điện</label>
                                    <input className="form-control" type="text" placeholder="700000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin đơn hàng */}
                    <div className="col-lg-4">
                        <div className="card border-secondary mb-5">
                            <div className="card-header bg-secondary border-0">
                                <h4 className="font-weight-semi-bold m-0">Tổng đơn hàng</h4>
                            </div>
                            <div className="card-body">
                                <h5 className="font-weight-medium mb-3">Sản phẩm</h5>
                                <div className="d-flex justify-content-between">
                                    <p>Áo sơ mi thời trang 1</p>
                                    <p>150.000 ₫</p>
                                </div>
                                <hr className="mt-0" />
                                <div className="d-flex justify-content-between mb-3 pt-1">
                                    <h6 className="font-weight-medium">Tạm tính</h6>
                                    <h6 className="font-weight-medium">150.000 ₫</h6>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <h6 className="font-weight-medium">Phí vận chuyển</h6>
                                    <h6 className="font-weight-medium">10.000 ₫</h6>
                                </div>
                            </div>
                            <div className="card-footer border-secondary bg-transparent">
                                <div className="d-flex justify-content-between mt-2">
                                    <h5 className="font-weight-bold">Tổng cộng</h5>
                                    <h5 className="font-weight-bold">160.000 ₫</h5>
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="card border-secondary mb-5">
                            <div className="card-header bg-secondary border-0">
                                <h4 className="font-weight-semi-bold m-0">Phương thức thanh toán</h4>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <div className="custom-control custom-radio">
                                        <input type="radio" className="custom-control-input" name="payment" id="paypal" />
                                        <label className="custom-control-label" htmlFor="paypal">Paypal</label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="custom-control custom-radio">
                                        <input type="radio" className="custom-control-input" name="payment" id="directcheck" />
                                        <label className="custom-control-label" htmlFor="directcheck">Thanh toán trực tiếp</label>
                                    </div>
                                </div>
                                <div className="">
                                    <div className="custom-control custom-radio">
                                        <input type="radio" className="custom-control-input" name="payment" id="banktransfer" />
                                        <label className="custom-control-label" htmlFor="banktransfer">Chuyển khoản ngân hàng</label>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer border-secondary bg-transparent">
                                <button className="btn btn-lg btn-block btn-primary font-weight-bold my-3 py-3">
                                    Đặt hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}