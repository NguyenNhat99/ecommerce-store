import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import orderService from "../../services/orderService";

const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { setOrder(await orderService.getOne(id)); }
            finally { setLoading(false); }
        })();
    }, [id]);

    if (loading) return <div className="container py-5">Đang tải...</div>;
    if (!order) return <div className="container py-5">Không tìm thấy đơn hàng.</div>;

    return (
        <>
            <div className="container py-4">
                <Link to="/don-hang" className="btn btn-light mb-3">← Quay lại</Link>
                <div className="card shadow border-0">
                    <div className="card-body">
                        <h5 className="mb-3">Đơn hàng <code>{order.id}</code></h5>
                        <div className="row">
                            <div className="col-md-6">
                                <p><b>Ngày đặt:</b> {order.orderDate ? new Date(order.orderDate).toLocaleString("vi-VN") : "-"}</p>
                                <p><b>Tổng tiền:</b> {toVnd(order.totalAmount)}</p>
                                <p><b>Trạng thái:</b> {order.orderStatus}</p>
                            </div>
                            <div className="col-md-6">
                                <p><b>Thanh toán:</b> {order.paymentMethod} — {order.paymentStatus}</p>
                                {order.paymentDate && <p><b>Ngày thanh toán:</b> {new Date(order.paymentDate).toLocaleString("vi-VN")}</p>}
                                {order.transactionId && <p><b>Mã giao dịch:</b> {order.transactionId}</p>}
                            </div>
                        </div>

                        {/* Nếu BE trả OrderItems kèm theo, render bảng chi tiết ở đây */}
                        {/* <table className="table table-sm mt-3"> ... </table> */}
                    </div>
                </div>
            </div>
        </>
    );
}
