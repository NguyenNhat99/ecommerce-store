import { useEffect, useState, useMemo } from "react";
import {
    Container, Row, Col, Card, Button, Form, Spinner, Alert,
    Modal, Badge, Table, Pagination, Toast, ToastContainer
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../../../services/authService";

const MOCK_ORDERS = [
    { id: "HD001", status: "Delivered", total: 200000, date: "2024-07-10", address: "Hà Nội", items: [{ name: "Áo thun", qty: 2 }] },
    { id: "HD002", status: "Shipping", total: 450000, date: "2024-07-15", address: "Đà Nẵng", items: [{ name: "Quần jeans", qty: 1 }] },
    { id: "HD003", status: "Cancelled", total: 150000, date: "2024-07-18", address: "TP.HCM", items: [{ name: "Áo sơ mi", qty: 1 }] },
];

const ROLE_DISPLAY = {
    Admin: { label: "Admin", variant: "danger" },
    Staff: { label: "Nhân viên", variant: "info" },
    Customer: { label: "Khách hàng", variant: "success" },
    User: { label: "User", variant: "secondary" },
};

export default function DetailAccountBootstrap() {
    const { email } = useParams();
    const navigate = useNavigate();

    const [account, setAccount] = useState(null);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phoneNumber: "", address: "", gender: "true",
    });
    const [role, setRole] = useState("");

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

    // orders (mock)
    const [page, setPage] = useState(1);
    const perPage = 5;
    const orders = MOCK_ORDERS;
    const totalPages = Math.ceil(orders.length / perPage);
    const pagedOrders = orders.slice((page - 1) * perPage, page * perPage);

    // toast
    const [toast, setToast] = useState({ show: false, bg: "success", msg: "" });
    const showToast = (msg, bg = "success") => setToast({ show: true, msg, bg });

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
                setRole(data.role);
                setLockoutEnabled(!!data.lockoutEnabled);
                // data.lockoutEnd có thể null hoặc ISO
                setLockoutEnd(data.lockoutEnd ?? null);
            })
            .catch((err) => {
                setError(err?.message || "Không thể tải dữ liệu tài khoản");
                setAccount(null);
            })
            .finally(() => setLoading(false));
    }, [email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await authService.updateInformation(form);
            showToast("Cập nhật thành công", "success");
        } catch {
            showToast("Cập nhật thất bại", "danger");
        } finally {
            setSaving(false);
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
            // datetime-local là local time, cần convert sang ISO chuẩn
            const dt = new Date(lockCustom);
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
            // cập nhật UI từ server
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
                                    <Form.Group className="mb-3">
                                        <Form.Label>Vai trò</Form.Label>
                                        <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                                            <option value="Staff">Nhân viên</option>
                                            <option value="Customer">Khách hàng</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex gap-2">
                                <Button onClick={handleSave} disabled={saving}>
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

                    <Card>
                        <Card.Header>
                            <strong>Đơn hàng</strong>
                        </Card.Header>
                        <Card.Body>
                            <Table hover responsive>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Ngày</th>
                                        <th>Trạng thái</th>
                                        <th>Tổng tiền</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedOrders.map((o) => (
                                        <tr key={o.id}>
                                            <td>{o.id}</td>
                                            <td>{o.date}</td>
                                            <td>
                                                <Badge
                                                    bg={o.status === "Delivered" ? "success" : o.status === "Shipping" ? "info" : "danger"}
                                                >
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td>{o.total.toLocaleString()} đ</td>
                                            <td>
                                                <Button size="sm" variant="outline-info" onClick={() => setShowOrder({ show: true, order: o })}>
                                                    Chi tiết
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pagedOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted">Không có đơn hàng nào</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-end">
                                <Pagination>
                                    <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
                                </Pagination>
                            </div>
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
                                    min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} // tối thiểu +1 phút
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
                <Toast bg={toast.bg} onClose={() => setToast((t) => ({ ...t, show: false }))} show={toast.show} delay={2800} autohide>
                    <Toast.Body className="text-white">{toast.msg}</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}
