export default function CartPage() {
    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-3" >
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Giỏ hàng
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <a href="/">Trang chủ</a>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Giỏ hàng</p>
                    </div>
                </div>
            </div >

            <div className="container-fluid pt-5">
                <div className="row px-xl-5">
                    {/* Bảng giỏ hàng */}
                    <div className="col-lg-8 table-responsive mb-5">
                        <table className="table table-bordered text-center mb-0">
                            <thead className="bg-secondary text-dark">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th>Tổng</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody className="align-middle">
                                <tr>
                                    <td className="align-middle">
                                        <img src="img/product-1.jpg" alt="" style={{ width: "50px" }} />
                                        Áo sơ mi thời trang
                                    </td>
                                    <td className="align-middle">150.000 ₫</td>
                                    <td className="align-middle">
                                        <div className="input-group quantity mx-auto" style={{ width: "100px" }}>
                                            <div className="input-group-btn">
                                                <button className="btn btn-sm btn-primary btn-minus">
                                                    <i className="fa fa-minus"></i>
                                                </button>
                                            </div>
                                            <input type="text" className="form-control form-control-sm bg-secondary text-center" defaultValue="1" />
                                            <div className="input-group-btn">
                                                <button className="btn btn-sm btn-primary btn-plus">
                                                    <i className="fa fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="align-middle">150.000 ₫</td>
                                    <td className="align-middle">
                                        <button className="btn btn-sm btn-primary">
                                            <i className="fa fa-times"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Tóm tắt giỏ hàng */}
                    <div className="col-lg-4">
                        <form className="mb-5">
                            <div className="input-group">
                                <input type="text" className="form-control p-4" placeholder="Mã giảm giá" />
                                <div className="input-group-append">
                                    <button className="btn btn-primary">Áp dụng</button>
                                </div>
                            </div>
                        </form>

                        <div className="card border-secondary mb-5">
                            <div className="card-header bg-secondary border-0">
                                <h4 className="font-weight-semi-bold m-0">Tóm tắt đơn hàng</h4>
                            </div>
                            <div className="card-body">
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
                                <button className="btn btn-block btn-primary my-3 py-3">
                                    Tiến hành thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}