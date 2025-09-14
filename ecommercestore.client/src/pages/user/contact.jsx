// src/pages/user/OrderLookup.jsx
import { useState } from "react";
import orderService from "@/services/orderService";

const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

const ORDER_STATUS_LABEL = {
    awaitpay: "Chờ thanh toán",
    pend: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao hàng",
    success: "Hoàn tất",
    cancel: "Đã hủy",
    err: "Lỗi",
};

const PAYMENT_STATUS_LABEL = {
    Pending: "Chờ thanh toán",
    Paid: "Đã thanh toán",
    Failed: "Thanh toán thất bại",
    Refunded: "Đã hoàn tiền",
    Processing: "Đang xử lý",
};

export default function OrderLookupPage() {
    const [code, setCode] = useState("");
    const [q, setQ] = useState(""); // email hoặc SĐT
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [order, setOrder] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setOrder(null);
        if (!code.trim() || !q.trim()) {
            setErr("Vui lòng nhập mã đơn hàng và email/SĐT.");
            return;
        }
        try {
            setLoading(true);
            const data = await orderService.lookup({ code: code.trim(), emailOrPhone: q.trim() });
            setOrder(data);
        } catch (e) {
            console.error(e);
            setErr(e?.response?.data?.message || "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    const dateStr = (s) => {
        if (!s) return "";
        const d = new Date(s);
        if (isNaN(d)) return String(s);
        return d.toLocaleString("vi-VN", { hour12: false });
    };

    return (
        <>
            {/* Hero/header giống trang Liên hệ để đồng bộ UI */}
            <div className="container-fluid bg-secondary mb-3">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 300 }}>
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">Tra cứu đơn hàng</h1>
                    <div className="d-inline-flex">
                        <p className="m-0"><a href="/">Trang chủ</a></p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Tra cứu</p>
                    </div>
                </div>
            </div>

            {/* Form tra cứu */}
            <div className="container-fluid pt-4 pb-5">
                <div className="row px-xl-5">
                    <div className="col-lg-7 mb-4">
                        <div className="card">
                            <div className="card-header"><strong>Nhập thông tin tra cứu</strong></div>
                            <div className="card-body">
                                {err && <div className="alert alert-danger py-2">{err}</div>}
                                <form onSubmit={onSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Mã đơn hàng</label>
                                        <input
                                            className="form-control"
                                            placeholder="VD: ORD20240901-ABC123"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email hoặc Số điện thoại</label>
                                        <input
                                            className="form-control"
                                            placeholder="Nhập email hoặc số điện thoại đã dùng đặt hàng"
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                                        {loading ? "Đang tra cứu..." : "Tra cứu"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Kết quả */}
                    <div className="col-lg-5 mb-4">
                        {order ? (
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <strong>Thông tin đơn hàng</strong>
                                    <span className="text-muted small">{order.id}</span>
                                </div>
                                <div className="card-body">
                                    <div className="mb-2"><span className="text-muted">Ngày đặt: </span>{dateStr(order.orderDate)}</div>
                                    <div className="mb-2"><span className="text-muted">Khách hàng: </span>{order.customerName || "-"}</div>
                                    <div className="mb-2">
                                        <span className="text-muted">Trạng thái: </span>
                                        <span className="badge bg-info text-dark">{ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-muted">Thanh toán: </span>
                                        <span className="badge bg-secondary">{PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus}</span>
                                    </div>
                                    <div className="mb-3"><span className="text-muted">Tổng tiền: </span><strong>{toVnd(order.totalAmount)}</strong></div>

                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th className="text-end" style={{ width: 80 }}>SL</th>
                                                    <th className="text-end" style={{ width: 140 }}>Đơn giá</th>
                                                    <th className="text-end" style={{ width: 140 }}>Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(order.items || []).map((it, i) => (
                                                    <tr key={i}>
                                                        <td className="text-break">{it.name || it.productName || `SP #${it.productId}`}</td>
                                                        <td className="text-end">{it.qty || it.quantity}</td>
                                                        <td className="text-end">{toVnd(it.price || it.unitPrice)}</td>
                                                        <td className="text-end">
                                                            {toVnd((it.price || it.unitPrice || 0) * (it.qty || it.quantity || 0))}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {!order.items?.length && (
                                                    <tr><td colSpan={4} className="text-center text-muted">Không có sản phẩm.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted">Nhập thông tin để tra cứu đơn hàng của bạn.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
