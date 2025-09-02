import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table as RBTable,
    Button,
    Modal,
    Form,
    Spinner,
    Alert,
    InputGroup,
    Pagination as RBPagination,
    Badge,
} from "react-bootstrap";
import authService from "../../../services/authService"; // giữ nguyên path
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const ROLE_DISPLAY = {
    Admin: { label: "Admin", variant: "danger" },
    Staff: { label: "Nhân viên", variant: "info" },
    Customer: { label: "Khách hàng", variant: "success" },
    User: { label: "User", variant: "secondary" },
};

export default function ManagerAccountBootstrap() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // tìm kiếm
    const [search, setSearch] = useState("");

    // dialog xoá
    const [deletingId, setDeletingId] = useState(null);
    const [confirm, setConfirm] = useState({ show: false, user: null });

    // fetch data
    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await authService.getAllAccounts();
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Không tải được danh sách tài khoản!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // filter
    const filtered = useMemo(() => {
        if (!search.trim()) return accounts;
        const q = search.toLowerCase();
        return accounts.filter(
            (u) =>
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
        );
    }, [accounts, search]);

    // phân trang
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageItems = filtered.slice(startIndex, endIndex);

    const changePage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

    // xoá
    const handleDelete = async () => {
        if (!confirm.user) return;
        setDeletingId(confirm.user.email);
        try {
            // TODO: gọi API xoá nếu có
            setAccounts((prev) => prev.filter((u) => u.email !== confirm.user.email));
        } catch (err) {
            console.error(err);
            alert("Xoá thất bại");
        } finally {
            setDeletingId(null);
            setConfirm({ show: false, user: null });
        }
    };

    // component phân trang bootstrap
    const Pagination = () => {
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <RBPagination.Item
                    key={i}
                    active={i === page}
                    onClick={() => changePage(i)}
                >
                    {i}
                </RBPagination.Item>
            );
        }
        return (
            <RBPagination className="mb-0">
                <RBPagination.Prev
                    disabled={page === 1}
                    onClick={() => changePage(page - 1)}
                />
                {items}
                <RBPagination.Next
                    disabled={page === totalPages}
                    onClick={() => changePage(page + 1)}
                />
            </RBPagination>
        );
    };

    return (
        <Container fluid className="py-3">
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">
                                Danh sách tài khoản
                            </Card.Title>
                            <div className="d-flex gap-2">
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Tìm kiếm tên/email..."
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
                                        >
                                            ×
                                        </Button>
                                    )}
                                </InputGroup>
                                <Button variant="outline-secondary" onClick={fetchAccounts}>
                                    Làm mới
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="d-flex justify-content-center py-5">
                                    <Spinner animation="border" />
                                </div>
                            ) : error ? (
                                <Alert variant="danger">{error}</Alert>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <RBTable hover className="align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Họ tên</th>
                                                    <th>Email</th>
                                                    <th>Vai trò</th>
                                                    <th>Trạng thái</th>
                                                    <th>Địa chỉ</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center text-muted py-4">
                                                            Không có tài khoản nào.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pageItems.map((u, idx) => (
                                                        <tr key={u.email}>
                                                            <td>{startIndex + idx + 1}</td>
                                                            <td>{u.firstName} {u.lastName}</td>
                                                            <td>{u.email}</td>
                                                            <td>
                                                                <Badge bg={ROLE_DISPLAY[u.role]?.variant || "secondary"}>
                                                                    {ROLE_DISPLAY[u.role]?.label || u.role}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <span className="text-success">Hoạt động</span>
                                                            </td>
                                                            <td>{u.address}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-info"
                                                                        onClick={() => navigate(`/admin/quan-ly-tai-khoan/chi-tiet/${u.email}`)}
                                                                    >
                                                                        Chi tiết
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-danger"
                                                                        disabled={u.role === "Admin" || deletingId === u.email}
                                                                        onClick={() => setConfirm({ show: true, user: u })}
                                                                    >
                                                                        {deletingId === u.email ? (
                                                                            <>
                                                                                <Spinner animation="border" size="sm" className="me-1" />
                                                                                Đang xoá...
                                                                            </>
                                                                        ) : (
                                                                            "Xoá"
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </RBTable>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div className="text-muted small">
                                            Hiển thị {startIndex + 1}–{Math.min(endIndex, filtered.length)} /{" "}
                                            {filtered.length}
                                        </div>
                                        <Pagination />
                                    </div>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal xác nhận xoá */}
            <Modal
                show={confirm.show}
                onHide={() => setConfirm({ show: false, user: null })}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xoá</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xoá tài khoản{" "}
                    <b>
                        {confirm.user?.firstName} {confirm.user?.lastName}
                    </b>
                    ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirm({ show: false, user: null })}>
                        Huỷ
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deletingId === confirm.user?.email}>
                        Xoá
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
