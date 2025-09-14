import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/orderService";

const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

const Badge = ({ text, variant = "secondary" }) => (
    <span className={`badge badge-${variant}`} style={{ fontSize: 12 }}>{text}</span>
);

// ==== Mapping khớp BE ====
const ORDER_STATUS_LABEL = {
    awaitpay: "Chờ thanh toán",
    pend: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao DVVC",
    success: "Hoàn tất",
    cancel: "Đã hủy",
    err: "Lỗi",
};
const ORDER_STATUS_VARIANT = {
    awaitpay: "secondary",
    pend: "primary",
    processing: "warning",
    shipped: "info",
    success: "success",
    cancel: "dark",
    err: "danger",
};

const PAYMENT_STATUS_VARIANT = {
    Pending: "warning",
    Paid: "success",
    Failed: "danger",
    Refunded: "secondary",
    Processing: "info",
};
const PAYMENT_METHOD_LABEL = { vnp: "VNPay", cod: "COD" };

const fmtDateTime = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d) ? String(s) : d.toLocaleString("vi-VN", {
        hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    });
};

const normalizeVN = (str = "") =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function OrdersHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await orderService.getMyOrders(); // GET /orders/MyOrder
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            // BE có thể trả 404 khi chưa có đơn => coi như danh sách rỗng
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // tìm kiếm đa trường
    const filtered = useMemo(() => {
        let list = [...orders];
        const needle = normalizeVN(q);
        if (needle) {
            list = list.filter((o) => {
                const hay = normalizeVN(
                    [o?.id, o?.paymentMethod, o?.orderStatus, o?.paymentStatus,
                    o?.customerName, o?.customerPhone, o?.customerEmail].map(x => x ?? "").join(" ")
                );
                return hay.includes(needle);
            });
        }
        // sort: mới -> cũ
        list.sort((a, b) => new Date(b.orderDate ?? 0) - new Date(a.orderDate ?? 0));
        return list;
    }, [orders, q]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (loading) return <div className="container py-5">Đang tải lịch sử đơn hàng...</div>;

    return (
        <>
            {/* Header */}
            <div className="container-fluid bg-secondary mb-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 220 }}>
                    <h1 className="font-weight-semi-bold text-uppercase mb-2">Lịch sử đơn hàng</h1>
                    <div className="d-inline-flex">
                        <p className="m-0"><a href="/">Trang chủ</a></p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Đơn hàng của tôi</p>
                    </div>
                </div>
            </div>

            <div className="container pb-5">
                <div className="card shadow border-0">
                    <div className="card-body">
                        {/* Toolbar */}
                        <div className="d-flex flex-wrap mb-3 gap-2">
                            <input
                                className="form-control"
                                style={{ maxWidth: 360 }}
                                placeholder="Tìm theo mã đơn / trạng thái / phương thức / tên / sđt..."
                                value={q}
                                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            />
                        </div>

                        {/* Empty state */}
                        {pageItems.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                {orders.length === 0 ? "Chưa có đơn hàng nào." : "Không tìm thấy đơn hàng phù hợp."}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Ngày đặt</th>
                                            <th className="text-right">Tổng tiền</th>
                                            <th>Thanh toán</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageItems.map(o => (
                                            <tr key={o.id}>
                                                <td className="text-break"><code>{o.id}</code></td>
                                                <td>{fmtDateTime(o.orderDate)}</td>
                                                <td className="text-right">{toVnd(o.totalAmount)}</td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span>{PAYMENT_METHOD_LABEL[o.paymentMethod] || (o.paymentMethod || "-")}</span>
                                                        <Badge
                                                            text={o.paymentStatus || "-"}
                                                            variant={PAYMENT_STATUS_VARIANT[o.paymentStatus] || "secondary"}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge
                                                        text={ORDER_STATUS_LABEL[o.orderStatus] || o.orderStatus || "-"}
                                                        variant={ORDER_STATUS_VARIANT[o.orderStatus] || "secondary"}
                                                    />
                                                </td>
                                                <td>
                                                    <Link to={`/don-hang/${o.id}`} className="btn btn-sm btn-outline-primary">
                                                        Xem chi tiết
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav>
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>«</button>
                                    </li>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                                        <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>»</button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
