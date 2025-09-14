// src/pages/admin/orders/OrderDetailBootstrap.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Container, Row, Col, Card, Button, Badge, Spinner, Alert,
    ListGroup, Toast, ToastContainer
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import orderService from "../../../services/orderService"; // giữ path theo dự án

// Map & helpers
const PAYMENT_STATUS_VARIANT = {
    Pending: "warning",
    Paid: "success",
    Failed: "danger",
    Refunded: "secondary",
    Processing: "info",
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
const ORDER_STATUS_LABEL = {
    awaitpay: "Chờ thanh toán",
    pend: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao cho DVVC",
    success: "Hoàn tất",
    cancel: "Đã hủy",
    err: "Lỗi",
};
const PAYMENT_METHOD_LABEL = { vnp: "VNPay", cod: "COD" };

const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

const fmtDateTime = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d)) return String(s);
    return d.toLocaleString("vi-VN", {
        hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    });
};

// ===== Helpers cho danh sách sản phẩm (tương thích nhiều dạng BE) =====
const getItems = (order) => order?.items || order?.orderItems || [];
const getItemName = (it) => it?.product?.name || it?.productName || `SP#${it?.productId ?? ""}`;
const getItemImg = (it) =>
    it?.product?.thumbnailUrl || it?.product?.avatar || it?.imageUrl || null;
const getUnitPrice = (it) => Number(it?.unitPrice ?? it?.price ?? 0);
const getQty = (it) => Number(it?.quantity ?? it?.qty ?? 0);

export default function OrderDetailBootstrap() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: "", bg: "success" });

    const showToast = (msg, bg = "success") => setToast({ open: true, msg, bg });

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            setLoadErr("");
            const data = await orderService.getOne(id); // GET /orders/{id}
            setOrder(data);
        } catch {
            setLoadErr("Không tải được đơn hàng.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    // ====== ACTIONS: gọi API thật ======
    const updatePaymentStatus = async (next) => {
        if (!order) return;
        try {
            setBusy(true);
            await orderService.updatePaymentStatus(order.id, next); // PATCH /orders/{id}/payment-status
            await fetchOrder(); // đồng bộ lại từ server
            showToast("Cập nhật Payment Status thành công!");
        } catch (e) {
            showToast(typeof e === "string" ? e : "Cập nhật Payment Status thất bại!", "danger");
        } finally {
            setBusy(false);
        }
    };

    const updateOrderStatus = async (next) => {
        if (!order) return;
        try {
            setBusy(true);
            await orderService.updateOrderStatus(order.id, next); // PATCH /orders/{id}/order-status
            await fetchOrder();
            showToast("Cập nhật Order Status thành công!");
        } catch (e) {
            showToast(typeof e === "string" ? e : "Cập nhật Order Status thất bại!", "danger");
        } finally {
            setBusy(false);
        }
    };

    // Gợi ý lệnh theo trạng thái hiện tại
    const actions = useMemo(() => {
        if (!order) return [];
        const a = [];
        // THANH TOÁN
        if (order.paymentStatus === "Pending") {
            a.push({ key: "markPaid", label: "Đánh dấu đã thanh toán", onClick: () => updatePaymentStatus("Paid"), variant: "success" });
            a.push({ key: "markFailed", label: "Đánh dấu thanh toán thất bại", onClick: () => updatePaymentStatus("Failed"), variant: "outline-danger" });
        }
        if (order.paymentStatus === "Paid") {
            a.push({ key: "refund", label: "Đánh dấu hoàn tiền", onClick: () => updatePaymentStatus("Refunded"), variant: "outline-dark" });
        }

        // ĐƠN HÀNG
        if (order.orderStatus === "awaitpay") {
            a.push({ key: "toPending", label: "Chuyển sang CHỜ XỬ LÝ", onClick: () => updateOrderStatus("pend"), variant: "primary" });
            a.push({ key: "cancel1", label: "Hủy đơn", onClick: () => updateOrderStatus("cancel"), variant: "outline-danger" });
        } else if (order.orderStatus === "pend") {
            a.push({ key: "toProcessing", label: "Chuyển sang ĐANG XỬ LÝ", onClick: () => updateOrderStatus("processing"), variant: "warning" });
            a.push({ key: "cancel2", label: "Hủy đơn", onClick: () => updateOrderStatus("cancel"), variant: "outline-danger" });
        } else if (order.orderStatus === "processing") {
            a.push({ key: "toShipped", label: "Đánh dấu ĐÃ GIAO DVVC", onClick: () => updateOrderStatus("shipped"), variant: "info" });
        } else if (order.orderStatus === "shipped") {
            a.push({ key: "toSuccess", label: "Hoàn tất đơn", onClick: () => updateOrderStatus("success"), variant: "success" });
        }
        return a;
    }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <Container fluid className="py-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}>
                    <Spinner animation="border" className="me-2" /> Đang tải đơn hàng...
                </div>
            </Container>
        );
    }
    if (loadErr || !order) {
        return (
            <Container fluid className="py-4">
                <Alert variant="danger" className="mb-3">{loadErr || "Không tìm thấy đơn hàng."}</Alert>
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>← Quay lại</Button>
            </Container>
        );
    }

    const items = getItems(order);
    const subtotal = Array.isArray(items)
        ? items.reduce((s, it) => s + getUnitPrice(it) * getQty(it), 0)
        : 0;

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                {/* Header + Actions */}
                <Col xs={12}>
                    <Card>
                        <Card.Header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2">
                            <div>
                                <Card.Title as="h5" className="mb-1">Đơn hàng #{order.id}</Card.Title>
                                <div className="d-flex flex-wrap gap-2">
                                    <Badge bg={ORDER_STATUS_VARIANT[order.orderStatus] || "secondary"}>
                                        {ORDER_STATUS_LABEL[order.orderStatus] || order.orderStatus || "-"}
                                    </Badge>
                                    <Badge bg={PAYMENT_STATUS_VARIANT[order.paymentStatus] || "secondary"}>
                                        {order.paymentStatus || "-"}
                                    </Badge>
                                    <Badge bg="light" text="dark">
                                        {PAYMENT_METHOD_LABEL[order.paymentMethod] || (order.paymentMethod || "-")}
                                    </Badge>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                <Button variant="outline-secondary" onClick={() => navigate(-1)}>← Quay lại</Button>
                                <Button variant="outline-secondary" onClick={fetchOrder} disabled={busy}>
                                    {busy ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                                    Làm mới
                                </Button>
                            </div>
                        </Card.Header>
                    </Card>
                </Col>

                {/* Thông tin KH / Giao nhận */}
                <Col lg={6}>
                    <Card>
                        <Card.Header><Card.Title as="h6" className="mb-0">Thông tin khách hàng</Card.Title></Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Khách hàng:</strong> {order.customerName || "-"}</ListGroup.Item>
                                <ListGroup.Item><strong>Điện thoại:</strong> {order.customerPhone || "-"}</ListGroup.Item>
                                <ListGroup.Item><strong>Email:</strong> {order.customerEmail || "-"}</ListGroup.Item>
                                <ListGroup.Item className="text-break"><strong>Địa chỉ:</strong> {order.shippingAddress || "-"}</ListGroup.Item>
                                <ListGroup.Item className="text-break"><strong>Ghi chú:</strong> {order.note || "-"}</ListGroup.Item>
                                <ListGroup.Item><strong>Ngày đặt:</strong> {fmtDateTime(order.orderDate)}</ListGroup.Item>
                                <ListGroup.Item><strong>Tổng tiền:</strong> {toVnd(order.totalAmount)}</ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Thông tin Thanh toán */}
                <Col lg={6}>
                    <Card>
                        <Card.Header><Card.Title as="h6" className="mb-0">Thanh toán</Card.Title></Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <strong>Phương thức:</strong> {PAYMENT_METHOD_LABEL[order.paymentMethod] || (order.paymentMethod || "-")}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>Payment status:</strong>{" "}
                                    <Badge bg={PAYMENT_STATUS_VARIANT[order.paymentStatus] || "secondary"}>
                                        {order.paymentStatus || "-"}
                                    </Badge>
                                </ListGroup.Item>
                                <ListGroup.Item><strong>Payment date:</strong> {fmtDateTime(order.paymentDate)}</ListGroup.Item>
                                <ListGroup.Item className="text-break"><strong>TransactionId:</strong> {order.transactionId || "-"}</ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Actions */}
                <Col xs={12}>
                    <Card>
                        <Card.Header><Card.Title as="h6" className="mb-0">Lệnh</Card.Title></Card.Header>
                        <Card.Body className="d-flex flex-wrap gap-2">
                            {actions.length === 0 ? (
                                <div className="text-muted">Không có lệnh khả dụng cho trạng thái hiện tại.</div>
                            ) : actions.map(a => (
                                <Button key={a.key} variant={a.variant} disabled={busy} onClick={a.onClick}>
                                    {busy ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                                    {a.label}
                                </Button>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sản phẩm trong đơn */}
                <Col xs={12}>
                    <Card>
                        <Card.Header><Card.Title as="h6" className="mb-0">Sản phẩm trong đơn</Card.Title></Card.Header>
                        <Card.Body>
                            {!Array.isArray(items) || items.length === 0 ? (
                                <div className="text-muted">Không có sản phẩm nào trong đơn hoặc BE chưa trả OrderItems.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle">
                                        <thead className="thead-light">
                                            <tr>
                                                <th style={{ width: "50%" }}>Sản phẩm</th>
                                                <th style={{ width: "14%" }} className="text-center">SL</th>
                                                <th style={{ width: "18%" }} className="text-end">Đơn giá</th>
                                                <th style={{ width: "18%" }} className="text-end">Thành tiền</th>
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
                                                                        style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                                                                    />
                                                                ) : null}
                                                                <div>
                                                                    <div>{name}</div>
                                                                    {it?.sku && <small className="text-muted">SKU: {it.sku}</small>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">{qty}</td>
                                                        <td className="text-end">{toVnd(price)}</td>
                                                        <td className="text-end"><strong>{toVnd(lineTotal)}</strong></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan={3} className="text-end"><strong>Tạm tính</strong></td>
                                                <td className="text-end"><strong>{toVnd(subtotal)}</strong></td>
                                            </tr>
                                            {/* Nếu BE có ShippingFee/DiscountAmount, thêm các dòng dưới: */}
                                            {order.shippingFee ? (
                                                <tr>
                                                    <td colSpan={3} className="text-end"><strong>Phí vận chuyển</strong></td>
                                                    <td className="text-end"><strong>{toVnd(order.shippingFee)}</strong></td>
                                                </tr>
                                            ) : null}
                                            {order.discountAmount ? (
                                                <tr>
                                                    <td colSpan={3} className="text-end"><strong>Giảm giá</strong></td>
                                                    <td className="text-end"><strong>-{toVnd(order.discountAmount)}</strong></td>
                                                </tr>
                                            ) : null}
                                            <tr>
                                                <td colSpan={3} className="text-end"><strong>Tổng cộng</strong></td>
                                                <td className="text-end"><strong>{toVnd(order.totalAmount)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <ToastContainer position="bottom-end" className="p-3">
                <Toast
                    onClose={() => setToast(t => ({ ...t, open: false }))}
                    show={toast.open}
                    bg={toast.bg}
                    delay={2200}
                    autohide
                >
                    <Toast.Body className="text-white">{toast.msg}</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}
