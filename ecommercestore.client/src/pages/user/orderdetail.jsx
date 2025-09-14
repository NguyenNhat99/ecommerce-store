import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import orderService from "../../services/orderService";

const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

const ORDER_STATUS_LABEL = {
    awaitpay: "Chờ thanh toán",
    pend: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao DVVC",
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
const PAYMENT_METHOD_LABEL = { vnp: "VNPay", cod: "COD" };

const fmtDateTime = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d)
        ? String(s)
        : d.toLocaleString("vi-VN", {
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
};

// ===== Helpers an toàn cho OrderItems (tương thích nhiều dạng map BE) =====
const getItems = (order) => order?.items || order?.orderItems || [];
const getItemName = (it) => it?.product?.name || it?.productName || `SP#${it?.productId ?? ""}`;
const getItemImg = (it) =>
    it?.product?.thumbnailUrl || it?.product?.imageUrl || it?.imageUrl || null;
const getUnitPrice = (it) => Number(it?.unitPrice ?? it?.price ?? 0);
const getQty = (it) => Number(it?.quantity ?? it?.qty ?? 0);

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        setLoadErr("");
        try {
            const data = await orderService.getOne(id); // GET /orders/{id}
            setOrder(data);
            console.log(data)
        } catch {
            setLoadErr("Không tìm thấy đơn hàng.");
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    if (loading) return <div className="container py-5">Đang tải...</div>;
    if (loadErr || !order) return <div className="container py-5">{loadErr || "Không tìm thấy đơn hàng."}</div>;

    const items = getItems(order);
    const computedSubtotal = Array.isArray(items)
        ? items.reduce((s, it) => s + getUnitPrice(it) * getQty(it), 0)
        : 0;

    return (
        <>
            <div className="container py-4">
                <Link to="/don-hang" className="btn btn-light mb-3">
                    ← Quay lại
                </Link>

                <div className="card shadow border-0 mb-3">
                    <div className="card-body">
                        <h5 className="mb-3">
                            Đơn hàng <code>{order.id}</code>
                        </h5>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="mb-2">
                                    <b>Ngày đặt:</b> {fmtDateTime(order.orderDate)}
                                </div>
                                <div className="mb-2">
                                    <b>Tổng tiền:</b> {toVnd(order.totalAmount)}
                                </div>
                                <div className="mb-2">
                                    <b>Trạng thái:</b>{" "}
                                    {ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus || "-"}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="mb-2">
                                    <b>Thanh toán:</b>{" "}
                                    {PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod || "-"}
                                    {" — "}
                                    {PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus || "-"}
                                </div>
                                {order.paymentDate && (
                                    <div className="mb-2">
                                        <b>Ngày thanh toán:</b> {fmtDateTime(order.paymentDate)}
                                    </div>
                                )}
                                {order.transactionId && (
                                    <div className="mb-2 text-break">
                                        <b>Mã giao dịch:</b> {order.transactionId}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin KH */}
                <div className="card shadow border-0">
                    <div className="card-body">
                        <h6 className="mb-3">Thông tin khách hàng</h6>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <b>Khách hàng:</b> {order.customerName || "-"}
                            </div>
                            <div className="col-md-6">
                                <b>Điện thoại:</b> {order.customerPhone || "-"}
                            </div>
                            <div className="col-md-6">
                                <b>Email:</b> {order.customerEmail || "-"}
                            </div>
                            <div className="col-md-12 text-break">
                                <b>Địa chỉ:</b> {order.shippingAddress || "-"}
                            </div>
                            {order.note && (
                                <div className="col-md-12 text-break">
                                    <b>Ghi chú:</b> {order.note}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sản phẩm trong đơn */}
                <div className="card shadow border-0 mt-3">
                    <div className="card-body">
                        <h6 className="mb-3">Sản phẩm trong đơn</h6>

                        {!Array.isArray(items) || items.length === 0 ? (
                            <div className="text-muted">
                                Không có sản phẩm nào trong đơn hoặc BE chưa trả OrderItems.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm align-middle">
                                    <thead className="thead-light">
                                        <tr>
                                            <th style={{ width: "52%" }}>Sản phẩm</th>
                                            <th style={{ width: "16%" }} className="text-center">
                                                SL
                                            </th>
                                            <th style={{ width: "16%" }} className="text-right">
                                                Đơn giá
                                            </th>
                                            <th style={{ width: "16%" }} className="text-right">
                                                Thành tiền
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((it, idx) => {
                                            const name = getItemName(it);
                                            const qty = getQty(it);
                                            const price = getUnitPrice(it);
                                            const lineTotal = qty * price;
                                            const img = getItemImg(it);
                                            return (
                                                <tr key={idx}>
                                                    <td className="text-break">
                                                        <div className="d-flex align-items-center gap-2">
                                                            {img ? (
                                                                <img
                                                                    src={img}
                                                                    alt={name}
                                                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                                                                />
                                                            ) : null}
                                                            <div>
                                                                <div>{name}</div>
                                                                {/* Nếu có thuộc tính/biến thể như size/color, hiển thị thêm tại đây */}
                                                                {it?.sku && <small className="text-muted">SKU: {it.sku}</small>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">{qty}</td>
                                                    <td className="text-right">{toVnd(price)}</td>
                                                    <td className="text-right">
                                                        <strong>{toVnd(lineTotal)}</strong>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="text-right">
                                                <strong>Tạm tính</strong>
                                            </td>
                                            <td className="text-right">
                                                <strong>{toVnd(computedSubtotal)}</strong>
                                            </td>
                                        </tr>
                                        {/* Nếu có phí ship/giảm giá từ BE, thêm dòng ở đây */}
                                        <tr>
                                            <td colSpan={3} className="text-right">
                                                <strong>Tổng cộng</strong>
                                            </td>
                                            <td className="text-right">
                                                <strong>{toVnd(order.totalAmount)}</strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
