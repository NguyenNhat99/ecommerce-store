import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";

const formatVND = (n) =>
    (Number(n || 0)).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

export default function CheckoutSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    const orderRaw = location.state?.order?.data ?? location.state?.order ?? null;

    const order = useMemo(() => {
        if (!orderRaw) return null;
        const get = (obj, ...keys) => keys.find((k) => obj?.[k] !== undefined) ?? null;

        return {
            code:
                orderRaw.Id ??
                orderRaw.id ??
                orderRaw.OrderCode ??
                orderRaw.orderCode ??
                "",
            total:
                orderRaw.TotalAmount ??
                orderRaw.totalAmount ??
                orderRaw.amount ??
                0,
            paymentMethod:
                orderRaw.PaymentMethod ??
                orderRaw.paymentMethod ??
                "COD",
            receiverName:
                orderRaw.CustomerName ??
                orderRaw.customerName ??
                "",
            receiverPhone:
                orderRaw.CustomerPhone ??
                orderRaw.customerPhone ??
                "",
            receiverEmail:
                orderRaw.CustomerEmail ??
                orderRaw.customerEmail ??
                "",
            shippingAddress:
                orderRaw.ShippingAddress ??
                orderRaw.shippingAddress ??
                "",
        };
    }, [orderRaw]);

    useEffect(() => {
        if (!orderRaw) {
            navigate("/gio-hang", { replace: true });
        }
    }, [orderRaw, navigate]);

    if (!order) return null; 

    return (
        <div>
            <div className="container-fluid bg-secondary mb-3">
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Thanh toán thành công
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <Link to="/">Trang chủ</Link>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Thanh toán thành công</p>
                    </div>
                </div>
            </div>

            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4 p-md-5 text-center">
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: 88,
                                        height: 88,
                                        borderRadius: "50%",
                                        background: "rgba(40, 167, 69, 0.1)",
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="44"
                                        height="44"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                        style={{ color: "#28a745" }}
                                    >
                                        <path d="M13.485 1.929a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06L5.25 8.439l6.97-6.97a.75.75 0 0 1 1.06 0z" />
                                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13" />
                                    </svg>
                                </div>

                                <h3 className="mb-2">Cảm ơn bạn!</h3>
                                <p className="text-muted mb-4">
                                    Đơn hàng của bạn đã được đặt thành công. Chúng tôi đã gửi thông tin
                                    chi tiết về đơn hàng qua email.
                                </p>

                                <div className="row text-left g-3 justify-content-center">
                                    <div className="col-md-10">
                                        <div className="list-group list-group-flush">
                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="text-muted">Mã đơn hàng</span>
                                                <strong>{order.code}</strong>
                                            </div>

                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="text-muted">Tổng thanh toán</span>
                                                <strong>{formatVND(order.total)}</strong>
                                            </div>

                                            <div className="list-group-item d-flex justify-content-between align-items-center">
                                                <span className="text-muted">Phương thức thanh toán</span>
                                                <strong>
                                                    {typeof order.paymentMethod === "string"
                                                        ? order.paymentMethod.toUpperCase() === "COD"
                                                            ? "Thanh toán trực tiếp (COD)"
                                                            : order.paymentMethod
                                                        : String(order.paymentMethod)}
                                                </strong>
                                            </div>

                                            <div className="list-group-item">
                                                <div className="mb-2 text-muted">Thông tin nhận hàng</div>
                                                <div className="d-flex flex-column">
                                                    <span><strong>{order.receiverName}</strong></span>
                                                    <span>{order.receiverPhone}</span>
                                                    <span>{order.receiverEmail}</span>
                                                    <span className="mt-2">{order.shippingAddress}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 d-flex flex-column flex-sm-row gap-2 justify-content-center">
                                    <Link to="/" className="btn btn-primary btn-lg px-4">
                                        Tiếp tục mua sắm
                                    </Link>
                                    <Link to="/tai-khoan/don-hang" className="btn btn-outline-secondary btn-lg px-4">
                                        Xem đơn hàng của tôi
                                    </Link>
                                </div>

                                <p className="text-muted mt-3 mb-0" style={{ fontSize: 14 }}>
                                    Nếu bạn cần hỗ trợ, vui lòng liên hệ CSKH qua hotline hoặc fanpage.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/san-pham" className="text-decoration-none">
                                &larr; Xem thêm sản phẩm
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
