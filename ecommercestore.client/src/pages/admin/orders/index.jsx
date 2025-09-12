// src/pages/admin/orders/ManagerOrderBootstrap.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Container, Row, Col, Card,
    Table as RBTable, Button, Form,
    Spinner, Alert, InputGroup, Pagination as RBPagination, Badge
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import orderService from "../../../services/orderService"; // cập nhật path nếu khác

const PAGE_SIZE = 10;

// Chuẩn hoá bỏ dấu + lower
function normalizeVN(str = "") {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
const toVnd = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " ₫";

// ==== Status/Method mapping khớp BE ====
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
    success: "success",
    cancel: "dark",
    err: "danger",
};
const ORDER_STATUS_LABEL = {
    awaitpay: "Chờ thanh toán",
    pend: "Chờ xử lý",
    success: "Hoàn tất",
    cancel: "Đã hủy",
    err: "Lỗi",
};
const PAYMENT_METHOD_LABEL = {
    vnp: "VNPay",
    cod: "COD",
};

export default function OrderPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // filter/search states
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState(search);
    const [paymentFilter, setPaymentFilter] = useState(""); // "", "Pending" | "Paid" | "Failed" | "Refunded" | "Processing"
    const [orderFilter, setOrderFilter] = useState("");     // "", "awaitpay" | "pend" | "success" | "cancel" | "err"

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError("");
            const data = await orderService.getAll(); // GET /orders
            setOrders(Array.isArray(data) ? data : []);
            setPage(1);
        } catch (err) {
            console.error(err);
            setLoadError("Không tải được danh sách đơn hàng.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filtered = useMemo(() => {
        let list = orders;
        // tìm kiếm đa trường
        if (debounced.trim()) {
            const q = normalizeVN(debounced);
            list = list.filter((o) => {
                const fields = [
                    o?.id,
                    o?.customerName,
                    o?.customerPhone,
                    o?.customerEmail,
                    o?.shippingAddress,
                ]
                    .map((x) => normalizeVN(String(x ?? "")))
                    .join(" ");
                return fields.includes(q);
            });
        }
        // lọc theo PaymentStatus
        if (paymentFilter) {
            list = list.filter((o) => (o?.paymentStatus ?? "") === paymentFilter);
        }
        // lọc theo OrderStatus (code dạng awaitpay/pend/...)
        if (orderFilter) {
            list = list.filter((o) => (o?.orderStatus ?? "") === orderFilter);
        }
        // sắp xếp mới nhất -> cũ (OrderDate)
        list = [...list].sort((a, b) => {
            const ta = new Date(a.orderDate ?? 0).getTime();
            const tb = new Date(b.orderDate ?? 0).getTime();
            return tb - ta;
        });
        return list;
    }, [orders, debounced, paymentFilter, orderFilter]);

    // pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageItems = useMemo(
        () => filtered.slice(startIndex, endIndex),
        [filtered, startIndex, endIndex]
    );

    const handleChangePage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

    const Pagination = () => {
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <RBPagination.Item key={i} active={i === page} onClick={() => handleChangePage(i)}>
                    {i}
                </RBPagination.Item>
            );
        }
        const showingFrom = filtered.length ? startIndex + 1 : 0;
        const showingTo = Math.min(endIndex, filtered.length);

        return (
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3">
                <div className="text-muted small">
                    Hiển thị <strong>{showingFrom}</strong>–<strong>{showingTo}</strong>{" "}
                    trong tổng số <strong>{filtered.length}</strong> đơn hàng
                </div>
                <RBPagination className="mb-0">
                    <RBPagination.Prev disabled={page === 1} onClick={() => handleChangePage(page - 1)} />
                    {items}
                    <RBPagination.Next
                        disabled={page === totalPages}
                        onClick={() => handleChangePage(page + 1)}
                    />
                </RBPagination>
            </div>
        );
    };

    const clearAllFilters = () => {
        setSearch("");
        setPaymentFilter("");
        setOrderFilter("");
        setPage(1);
    };

    const fmtDateTime = (s) => {
        if (!s) return "";
        const d = new Date(s);
        if (isNaN(d)) return String(s);
        return d.toLocaleString("vi-VN", {
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center justify-content-between">
                            <Card.Title as="h5" className="mb-0">
                                Danh sách đơn hàng
                            </Card.Title>

                            <div className="d-flex flex-column flex-xl-row gap-2 w-100 w-xl-auto">
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Tìm theo mã đơn / tên / sđt / email / địa chỉ..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                    {search && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setSearch("");
                                                setPage(1);
                                            }}
                                            title="Xóa tìm kiếm"
                                        >
                                            ×
                                        </Button>
                                    )}
                                </InputGroup>

                                <InputGroup>
                                    <Form.Select
                                        value={paymentFilter}
                                        onChange={(e) => {
                                            setPaymentFilter(e.target.value);
                                            setPage(1);
                                        }}
                                        aria-label="Lọc Payment Status"
                                    >
                                        <option value="">Payment Status: Tất cả</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Refunded">Refunded</option>
                                        <option value="Processing">Processing</option>
                                    </Form.Select>
                                    <Form.Select
                                        value={orderFilter}
                                        onChange={(e) => {
                                            setOrderFilter(e.target.value);
                                            setPage(1);
                                        }}
                                        aria-label="Lọc Order Status"
                                    >
                                        <option value="">Order Status: Tất cả</option>
                                        <option value="awaitpay">awaitpay — Chờ thanh toán</option>
                                        <option value="pend">pend — Chờ xử lý</option>
                                        <option value="success">success — Hoàn tất</option>
                                        <option value="cancel">cancel — Đã hủy</option>
                                        <option value="err">err — Lỗi</option>
                                    </Form.Select>
                                </InputGroup>

                                <div className="d-flex gap-2">
                                    <Button variant="outline-secondary" onClick={fetchOrders}>
                                        Làm mới
                                    </Button>
                                    <Button variant="outline-dark" onClick={clearAllFilters}>
                                        Xóa lọc
                                    </Button>
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body className="rounded-bottom-3">
                            {isLoading ? (
                                <div className="d-flex align-items-center justify-content-center py-5">
                                    <Spinner animation="border" role="status" className="me-2" />
                                    <span>Đang tải danh sách...</span>
                                </div>
                            ) : loadError ? (
                                <Alert variant="danger" className="mb-0">
                                    {loadError}
                                </Alert>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <RBTable hover className="align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ minWidth: 160 }}>Mã đơn</th>
                                                    <th style={{ minWidth: 130 }}>Ngày đặt</th>
                                                    <th>Khách hàng</th>
                                                    <th>Điện thoại</th>
                                                    <th>Email</th>
                                                    <th>Địa chỉ</th>
                                                    <th className="text-end" style={{ minWidth: 130 }}>Tổng tiền</th>
                                                    <th>Thanh toán</th>
                                                    <th>Trạng thái</th>
                                                    <th style={{ width: 120 }}>Lệnh</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={10} className="text-center text-muted py-4">
                                                            {orders.length === 0
                                                                ? "Chưa có đơn hàng nào."
                                                                : "Không tìm thấy đơn hàng phù hợp."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pageItems.map((o) => (
                                                        <tr key={o.id}>
                                                            <td className="text-break">{o.id}</td>
                                                            <td>{fmtDateTime(o.orderDate)}</td>
                                                            <td className="text-break">{o.customerName}</td>
                                                            <td>{o.customerPhone}</td>
                                                            <td className="text-break">{o.customerEmail}</td>
                                                            <td className="text-break">{o.shippingAddress}</td>
                                                            <td className="text-end fw-semibold">{toVnd(o.totalAmount)}</td>
                                                            <td>
                                                                <div className="d-flex flex-column">
                                                                    <span>{PAYMENT_METHOD_LABEL[o.paymentMethod] || (o.paymentMethod || "-")}</span>
                                                                    <Badge
                                                                        bg={PAYMENT_STATUS_VARIANT[o.paymentStatus] || "secondary"}
                                                                        className="align-self-start mt-1"
                                                                    >
                                                                        {o.paymentStatus || "-"}
                                                                    </Badge>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Badge bg={ORDER_STATUS_VARIANT[o.orderStatus] || "secondary"}>
                                                                    {ORDER_STATUS_LABEL[o.orderStatus] || o.orderStatus || "-"}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    onClick={() => navigate(`/admin/quan-ly-don-hang/chi-tiet/${o.id}`)}
                                                                >
                                                                    Chi tiết
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </RBTable>
                                    </div>
                                    <Pagination />
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
