// src/pages/admin/accounts/detailAccount.jsx
import { useEffect, useState, useMemo } from "react";
import {
    Container, Row, Col, Card, Button, Form, Spinner, Alert,
    Modal, Badge, Table, Pagination, Toast, ToastContainer
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import orderService from "../../../services/orderService";

// ====== Helpers & Mappings ======
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
    shipped: "Đã giao DVVC",
    success: "Hoàn tất",
    cancel: "Đã hủy",
    err: "Lỗi",
};
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

export default function DetailAccountBootstrap() {
    const { email } = useParams();
    const navigate = useNavigate();

    const [account, setAccount] = useState(null);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phoneNumber: "", address: "", gender: "true",
    });

    // ===== Role: chỉ hiện Select khi bấm "Phân quyền" =====
    const [role, setRole] = useState("");
    const [editingRole, setEditingRole] = useState(false);
    const [savingRole, setSavingRole] = useState(false);

    // lockout states
    const [lockoutEnabled, setLockoutEnabled] = useState(false);
    const [lockoutEnd, setLockoutEnd] = useState(null); // string ISO hoặc null
    const isLocked = useMemo(() => {
        if (!lockoutEnd) return false;
        try { return new Date(lockoutEnd).getTime() > Date.now(); } catch { return false; }
    }, [lockoutEnd]);

    // ui states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // modal/xoá
    const [showDelete, setShowDelete] = useState(false);

    // lock modal
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockPreset, setLockPreset] = useState("15m"); // 15m | 1h | 1d | custom
    const [lockCustom, setLockCustom] = useState(""); // datetime-local
    const [lockLoading, setLockLoading] = useState(false);
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [toggleEnabledLoading, setToggleEnabledLoading] = useState(false);

    // ===== Orders (real) =====
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersErr, setOrdersErr] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 5;

    // toast
    const [toast, setToast] = useState({ show: false, bg: "success", msg: "" });
    const showToast = (msg, bg = "success") => setToast({ show: true, msg, bg });

    // ===== Fetch account =====
    useEffect(() => {
        if (!email) return;
        setLoading(true);
        authService
            .getAccountDetail(email)
            .then((data) => {
                setAccount(data);
                setForm({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    address: data.address || "",
                    gender: data.gender ? "true" : "false",
                });
                setRole(data.role || "Customer");
                setLockoutEnabled(!!data.lockoutEnabled);
                setLockoutEnd(data.lockoutEnd ?? null);
            })
            .catch((err) => {
                setError(err?.message || "Không thể tải dữ liệu tài khoản");
                setAccount(null);
            })
            .finally(() => setLoading(false));
    }, [email]);

    // ===== Fetch orders for this account (filter by customerEmail) =====
    useEffect(() => {
        if (!account?.email) return;
        const run = async () => {
            setOrdersLoading(true);
            setOrdersErr("");
            try {
                const data = await orderService.getAll(); // GET /orders
                const list = Array.isArray(data) ? data : [];
                const mine = list.filter(
                    (o) => (o?.customerEmail || "").toLowerCase() === account.email.toLowerCase()
                );
                mine.sort((a, b) => new Date(b.orderDate ?? 0) - new Date(a.orderDate ?? 0));
                setOrders(mine);
                setPage(1);
            } catch {
                setOrdersErr("Không tải được danh sách đơn hàng của tài khoản.");
            } finally {
                setOrdersLoading(false);
            }
        };
        run();
    }, [account?.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSaveInfo = async () => {
        setSaving(true);
        try {
            await authService.updateInformation(form);
            showToast("Cập nhật thông tin thành công", "success");
        } catch {
            showToast("Cập nhật thông tin thất bại", "danger");
        } finally {
            setSaving(false);
        }
    };

    // ====== Save Role riêng (chỉ khi đang editingRole) ======
    const handleSaveRole = async () => {
        if (!email || !role) return;
        setSavingRole(true);
        try {
            await authService.setRole(email, role); // POST /accounts/roles/set
            const fresh = await authService.getAccountDetail(email);
            setAccount(fresh);
            setRole(fresh.role || role);
            showToast("Cập nhật vai trò thành công", "success");
            setEditingRole(false);
        } catch (err) {
            showToast(err?.message || "Cập nhật vai trò thất bại!", "danger");
        } finally {
            setSavingRole(false);
        }
    };

    const confirmDelete = () => {
        setShowDelete(false);
        // TODO: Gọi API xóa nếu có
        showToast("Đã xoá tài khoản (demo)", "warning");
        navigate("/admin/quan-ly-tai-khoan");
    };

    // ===== Lock/Unlock helpers =====
    const computeUntilIso = () => {
        if (lockPreset === "custom") {
            if (!lockCustom) return null;
            const dt = new Date(lockCustom); // local -> ISO
            if (isNaN(dt.getTime())) return null;
            return dt.toISOString();
        }
        const now = new Date();
        if (lockPreset === "15m") return new Date(now.getTime() + 15 * 60 * 1000).toISOString();
        if (lockPreset === "1h") return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        if (lockPreset === "1d") return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        return null;
    };

    const handleLock = async () => {
        if (!email) return;
        const until = computeUntilIso(); // có thể null -> backend mặc định 15'
        setLockLoading(true);
        try {
            await authService.lockAccount(email, until || undefined);
            const fresh = await authService.getAccountDetail(email);
            setLockoutEnabled(!!fresh.lockoutEnabled);
            setLockoutEnd(fresh.lockoutEnd ?? null);
            showToast("Đã khóa tài khoản", "warning");
            setShowLockModal(false);
        } catch (err) {
            showToast(err?.message || "Khóa tài khoản thất bại!", "danger");
        } finally {
            setLockLoading(false);
        }
    };

    const handleUnlock = async () => {
        if (!email) return;
        setUnlockLoading(true);
        try {
            await authService.unlockAccount(email);
            const fresh = await authService.getAccountDetail(email);
            setLockoutEnabled(!!fresh.lockoutEnabled);
            setLockoutEnd(fresh.lockoutEnd ?? null);
            showToast("Đã mở khóa tài khoản", "success");
        } catch (err) {
            showToast(err?.message || "Mở khóa tài khoản thất bại!", "danger");
        } finally {
            setUnlockLoading(false);
        }
    };

    const handleToggleEnabled = async () => {
        if (!email) return;
        setToggleEnabledLoading(true);
        try {
            await authService.setLockoutEnabled(email, !lockoutEnabled);
            setLockoutEnabled(!lockoutEnabled);
            showToast(!lockoutEnabled ? "Đã bật tính năng lockout" : "Đã tắt tính năng lockout", "info");
        } catch (err) {
            showToast(err?.message || "Cập nhật lockout thất bại!", "danger");
        } finally {
            setToggleEnabledLoading(false);
        }
    };

    // ==== render ====
    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error || !account) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error || "Không tìm thấy tài khoản"}</Alert>
            </Container>
        );
    }

    const lockBadge = isLocked ? (
        <Badge bg="warning" className="ms-2">
            Đang khóa {lockoutEnd ? `(đến ${new Date(lockoutEnd).toLocaleString()})` : ""}
        </Badge>
    ) : (
        <Badge bg="success" className="ms-2">Đang mở</Badge>
    );

    const totalPages = Math.max(1, Math.ceil(orders.length / perPage));
    const pageSlice = orders.slice((page - 1) * perPage, page * perPage);

    return (
        <Container fluid className="py-3">
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <strong>Chi tiết tài khoản</strong>
                            <div className="d-flex align-items-center">
                                <span className="me-2">Lockout:</span>
                                <Form.Check
                                    type="switch"
                                    id="lockout-enabled"
                                    checked={lockoutEnabled}
                                    onChange={handleToggleEnabled}
                                    disabled={toggleEnabledLoading}
                                    label={lockoutEnabled ? "Bật" : "Tắt"}
                                />
                                {toggleEnabledLoading && <Spinner size="sm" className="ms-2" />}
                                {lockBadge}
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Họ</Form.Label>
                                        <Form.Control name="firstName" value={form.firstName} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên</Form.Label>
                                        <Form.Control name="lastName" value={form.lastName} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control name="email" value={form.email} disabled />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Số điện thoại</Form.Label>
                                        <Form.Control name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control name="address" value={form.address} onChange={handleChange} />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giới tính</Form.Label>
                                        <Form.Select name="gender" value={form.gender} onChange={handleChange}>
                                            <option value="true">Nam</option>
                                            <option value="false">Nữ</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label>Vai trò</Form.Label>
                                        {!editingRole ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <Form.Control value={role || ""} disabled readOnly style={{ maxWidth: 260 }} />
                                                <Button variant="outline-primary" onClick={() => setEditingRole(true)}>
                                                    Phân quyền
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <Form.Select
                                                    value={role}
                                                    onChange={(e) => setRole(e.target.value)}
                                                    disabled={savingRole}
                                                    style={{ maxWidth: 260 }}
                                                >
                                                    <option value="Staff">Nhân viên</option>
                                                    <option value="Customer">Khách hàng</option>
                                                </Form.Select>

                                                <Button variant="primary" onClick={handleSaveRole} disabled={savingRole}>
                                                    {savingRole ? "Đang lưu..." : "Lưu quyền"}
                                                </Button>

                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() => { setEditingRole(false); setRole(account.role || "Customer"); }}
                                                    disabled={savingRole}
                                                >
                                                    Hủy
                                                </Button>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex gap-2 mt-3">
                                <Button onClick={handleSaveInfo} disabled={saving}>
                                    {saving ? "Đang lưu..." : "Lưu thông tin"}
                                </Button>

                                {!isLocked ? (
                                    <Button variant="warning" onClick={() => setShowLockModal(true)}>
                                        Khóa
                                    </Button>
                                ) : (
                                    <Button variant="success" onClick={handleUnlock} disabled={unlockLoading}>
                                        {unlockLoading ? "Đang mở khóa..." : "Mở khóa"}
                                    </Button>
                                )}

                                <Button variant="danger" onClick={() => setShowDelete(true)}>
                                    Xoá
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* ===== ĐƠN HÀNG CỦA TÀI KHOẢN ===== */}
                    <Card>
                        <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <strong>Đơn hàng</strong>
                            <div className="text-muted small">
                                Tổng: <b>{orders.length}</b> đơn
                            </div>
                        </Card.Header>

                        <Card.Body>
                            {ordersLoading ? (
                                <div className="d-flex align-items-center justify-content-center py-4">
                                    <Spinner animation="border" className="me-2" /> Đang tải đơn hàng...
                                </div>
                            ) : ordersErr ? (
                                <Alert variant="danger" className="mb-0">{ordersErr}</Alert>
                            ) : (
                                <>
                                    <Table hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày</th>
                                                <th>Thanh toán</th>
                                                <th>Trạng thái</th>
                                                <th className="text-end">Tổng tiền</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pageSlice.map((o) => (
                                                <tr key={o.id}>
                                                    <td className="text-break">{o.id}</td>
                                                    <td>{fmtDateTime(o.orderDate)}</td>
                                                    <td>
                                                        <Badge bg={PAYMENT_STATUS_VARIANT[o.paymentStatus] || "secondary"}>
                                                            {o.paymentStatus || "-"}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg={ORDER_STATUS_VARIANT[o.orderStatus] || "secondary"}>
                                                            {ORDER_STATUS_LABEL[o.orderStatus] || o.orderStatus || "-"}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end">{toVnd(o.totalAmount)}</td>
                                                    <td>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-info"
                                                            onClick={() => navigate(`/admin/quan-ly-don-hang/chi-tiet/${o.id}`)}
                                                            title="Xem chi tiết đơn"
                                                        >
                                                            Chi tiết
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center text-muted">Tài khoản chưa có đơn hàng nào</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>

                                    {orders.length > 0 && (
                                        <div className="d-flex justify-content-end">
                                            <Pagination className="mb-0">
                                                <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                                                {Array.from({ length: totalPages }, (_, i) => (
                                                    <Pagination.Item
                                                        key={i + 1}
                                                        active={page === i + 1}
                                                        onClick={() => setPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Pagination.Item>
                                                ))}
                                                <Pagination.Next
                                                    disabled={page === totalPages}
                                                    onClick={() => setPage(page + 1)}
                                                />
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal xoá */}
            <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xoá</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xoá tài khoản{" "}
                    <b>{form.firstName} {form.lastName}</b> ({form.email}) không?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>Huỷ</Button>
                    <Button variant="danger" onClick={confirmDelete}>Xoá</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal khóa */}
            <Modal show={showLockModal} onHide={() => setShowLockModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Khóa tài khoản</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Thời hạn</Form.Label>
                            <Form.Select
                                value={lockPreset}
                                onChange={(e) => setLockPreset(e.target.value)}
                                disabled={lockLoading}
                            >
                                <option value="15m">15 phút</option>
                                <option value="1h">1 giờ</option>
                                <option value="1d">1 ngày</option>
                                <option value="custom">Tự chọn…</option>
                            </Form.Select>
                        </Form.Group>

                        {lockPreset === "custom" && (
                            <Form.Group className="mb-2">
                                <Form.Label>Khóa tới (ngày/giờ)</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={lockCustom}
                                    onChange={(e) => setLockCustom(e.target.value)}
                                    disabled={lockLoading}
                                    min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                />
                                <Form.Text className="text-muted">Thời gian sẽ được lưu theo UTC.</Form.Text>
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLockModal(false)} disabled={lockLoading}>
                        Huỷ
                    </Button>
                    <Button variant="warning" onClick={handleLock} disabled={lockLoading}>
                        {lockLoading ? <Spinner size="sm" className="me-2" /> : null}
                        Xác nhận khóa
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast */}
            <ToastContainer position="top-center" className="p-3">
                <Toast
                    bg={toast.bg}
                    onClose={() => setToast((t) => ({ ...t, show: false }))}
                    show={toast.show}
                    delay={2800}
                    autohide
                >
                    <Toast.Body className="text-white">{toast.msg}</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}
