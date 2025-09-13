import React, { useEffect, useMemo, useState } from "react";
import orderService from "../../services/orderService";

const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

const Badge = ({ text, variant }) => (
    <span className={`badge badge-${variant}`} style={{ fontSize: 12 }}>{text}</span>
);

const statusVariant = (s) => {
    switch (s) {
        case "Pending": return "warning";
        case "AwaitingPayment": return "secondary";
        case "Processing": return "info";
        case "Completed": return "success";
        case "Cancel": return "dark";
        default: return "light";
    }
};
const payVariant = (p) => {
    switch (p) {
        case "Paid": return "success";
        case "Pending": return "warning";
        case "Failed": return "danger";
        case "Refunded": return "secondary";
        default: return "light";
    }
};

export default function OrdersHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => {
        (async () => {
            try {
                const data = await orderService.getMyOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (e) {
                // có thể show toast
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const n = q.trim().toLowerCase();
        if (!n) return orders;
        return orders.filter(o =>
            (o.id || "").toLowerCase().includes(n) ||
            (o.paymentMethod || "").toLowerCase().includes(n) ||
            (o.orderStatus || "").toLowerCase().includes(n) ||
            (o.paymentStatus || "").toLowerCase().includes(n)
        );
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
                        <div className="d-flex flex-wrap mb-3">
                            <input
                                className="form-control mr-2 mb-2"
                                style={{ maxWidth: 320 }}
                                placeholder="Tìm theo mã đơn / trạng thái / phương thức..."
                                value={q}
                                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                            />
                        </div>

                        {/* Empty state */}
                        {pageItems.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                Chưa có đơn hàng nào.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Ngày đặt</th>
                                            <th>Tổng tiền</th>
                                            <th>Thanh toán</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageItems.map(o => (
                                            <tr key={o.id}>
                                                <td><code>{o.id}</code></td>
                                                <td>{o.orderDate ? new Date(o.orderDate).toLocaleString("vi-VN") : "-"}</td>
                                                <td className="text-right">{toVnd(o.totalAmount)}</td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span>{o.paymentMethod || "-"}</span>
                                                        <Badge text={o.paymentStatus} variant={payVariant(o.paymentStatus)} />
                                                    </div>
                                                </td>
                                                <td><Badge text={o.orderStatus} variant={statusVariant(o.orderStatus)} /></td>
                                                <td>
                                                    <a href={`/don-hang/${o.id}`} className="btn btn-sm btn-outline-primary">
                                                        Xem chi tiết
                                                    </a>
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
                                    <li className={`page-item ${page === 1 && "disabled"}`}>
                                        <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>«</button>
                                    </li>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <li key={i} className={`page-item ${page === i + 1 && "active"}`}>
                                            <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${page === totalPages && "disabled"}`}>
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
