// src/pages/admin/blogs/ManagerBlogBootstrap.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Container, Row, Col, Card, Table as RBTable, Button, Form,
    Spinner, Alert, InputGroup, Pagination as RBPagination, Badge,
    Modal, Toast, ToastContainer
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import blogService from "@/services/blogService";

const PAGE_SIZE = 10;
const normalizeVN = (str = "") =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function ManagerBlogPage() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // filters
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState(search);
    const [pubFilter, setPubFilter] = useState(""); // "", "published", "draft"

    // delete states
    const [confirmId, setConfirmId] = useState(null); // id đang chờ xác nhận xóa
    const [deletingId, setDeletingId] = useState(null); // id đang xóa (để disable nút)
    const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    const fetchBlogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError("");
            const data = await blogService.getAll(); // GET /api/blogs
            setBlogs(Array.isArray(data) ? data : []);
            setPage(1);
        } catch (err) {
            console.error(err);
            setLoadError("Không tải được danh sách bài viết.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

    const filtered = useMemo(() => {
        let list = blogs;

        if (debounced.trim()) {
            const q = normalizeVN(debounced);
            list = list.filter((b) => {
                const fields = [
                    b?.id, b?.title, b?.slug, b?.content, b?.thumbnail, b?.thumbnailUrl
                ].map(x => normalizeVN(String(x ?? ""))).join(" ");
                return fields.includes(q);
            });
        }

        if (pubFilter) {
            if (pubFilter === "published") list = list.filter(b => b.isPublished === true);
            else if (pubFilter === "draft") list = list.filter(b => b.isPublished === false);
        }

        // mới nhất -> cũ
        list = [...list].sort((a, b) => {
            const ta = new Date(a.createdAt ?? 0).getTime();
            const tb = new Date(b.createdAt ?? 0).getTime();
            return tb - ta;
        });

        return list;
    }, [blogs, debounced, pubFilter]);

    // pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageItems = useMemo(() => filtered.slice(startIndex, endIndex), [filtered, startIndex, endIndex]);

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
                    trong tổng số <strong>{filtered.length}</strong> bài viết
                </div>
                <RBPagination className="mb-0">
                    <RBPagination.Prev disabled={page === 1} onClick={() => handleChangePage(page - 1)} />
                    {items}
                    <RBPagination.Next disabled={page === totalPages} onClick={() => handleChangePage(page + 1)} />
                </RBPagination>
            </div>
        );
    };

    const fmtDateTime = (s) => {
        if (!s) return "";
        const d = new Date(s);
        if (isNaN(d)) return String(s);
        return d.toLocaleString("vi-VN", {
            hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const thumbOf = (b) => b?.thumbnailUrl || b?.thumbnail || "";

    // ===== Delete handlers =====
    const handleRequestDelete = (id) => setConfirmId(id);

    const handleConfirmDelete = async () => {
        if (!confirmId) return;
        try {
            setDeletingId(confirmId);
            const ok = await blogService.delete(confirmId);
            if (ok) {
                // Xóa tối ưu (không cần gọi lại API): lọc ra khỏi state
                setBlogs(prev => prev.filter(x => x.id !== confirmId));
                setToast({ show: true, message: "Đã xóa bài viết.", variant: "success" });
            } else {
                // Trường hợp API trả khác 204 (hiếm)
                setToast({ show: true, message: "Không thể xóa bài viết.", variant: "danger" });
            }
        } catch (err) {
            console.error(err);
            const msg = err?.response?.status === 404
                ? "Bài viết không tồn tại hoặc đã bị xóa."
                : "Xóa thất bại. Vui lòng thử lại.";
            setToast({ show: true, message: msg, variant: "danger" });
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <Card.Title as="h5" className="mb-0">Quản lý bài viết</Card.Title>

                            {/* Toolbar nhỏ gọn (size="sm") */}
                            <div className="d-flex align-items-center gap-2">
                                <InputGroup size="sm" style={{ maxWidth: 360 }}>
                                    <Form.Control
                                        placeholder="Tìm theo tiêu đề / slug / nội dung…"
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    />
                                    {search && (
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            onClick={() => { setSearch(""); setPage(1); }}
                                            title="Xóa tìm kiếm"
                                        >
                                            ×
                                        </Button>
                                    )}
                                </InputGroup>

                                {/* Đổi nhãn filter: Hiển thị / Ẩn */}
                                <Form.Select
                                    size="sm"
                                    value={pubFilter}
                                    onChange={(e) => { setPubFilter(e.target.value); setPage(1); }}
                                    aria-label="Lọc trạng thái"
                                    style={{ width: 220 }}
                                >
                                    <option value="">Trạng thái: Tất cả</option>
                                    <option value="published">Hiển thị</option>
                                    <option value="draft">Ẩn</option>
                                </Form.Select>

                                <Button size="sm" variant="outline-secondary" onClick={fetchBlogs}>
                                    Làm mới
                                </Button>
                                <Button size="sm" variant="primary" onClick={() => navigate("/admin/blogs/create")}>
                                    + Thêm bài viết
                                </Button>
                            </div>
                        </Card.Header>

                        <Card.Body className="rounded-bottom-3">
                            {isLoading ? (
                                <div className="d-flex align-items-center justify-content-center py-5">
                                    <Spinner animation="border" role="status" className="me-2" />
                                    <span>Đang tải danh sách...</span>
                                </div>
                            ) : loadError ? (
                                <Alert variant="danger" className="mb-0">{loadError}</Alert>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <RBTable hover className="align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ minWidth: 80 }}>ID</th>
                                                    <th style={{ minWidth: 220 }}>Tiêu đề</th>
                                                    <th style={{ minWidth: 180 }}>Slug</th>
                                                    <th>Ảnh</th>
                                                    <th style={{ minWidth: 140 }}>Ngày tạo</th>
                                                    <th style={{ minWidth: 120 }}>Trạng thái</th>
                                                    <th style={{ width: 160 }}>Lệnh</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center text-muted py-4">
                                                            {blogs.length === 0 ? "Chưa có bài viết nào." : "Không tìm thấy bài viết phù hợp."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pageItems.map((b) => (
                                                        <tr key={b.id}>
                                                            <td>{b.id}</td>
                                                            <td className="text-break">{b.title}</td>
                                                            <td className="text-break">{b.slug}</td>
                                                            <td>
                                                                {thumbOf(b) ? (
                                                                    <img
                                                                        src={thumbOf(b)}
                                                                        alt="thumb"
                                                                        style={{ width: 64, height: 40, objectFit: "cover", borderRadius: 6 }}
                                                                    />
                                                                ) : <span className="text-muted">—</span>}
                                                            </td>
                                                            <td>{fmtDateTime(b.createdAt)}</td>

                                                            {/* Đổi nhãn: Hiển thị / Ẩn */}
                                                            <td>
                                                                {b.isPublished
                                                                    ? <Badge bg="success">Hiển thị</Badge>
                                                                    : <Badge bg="secondary">Ẩn</Badge>}
                                                            </td>

                                                            {/* Lệnh: Sửa + Xóa */}
                                                            <td className="d-flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    onClick={() => navigate(`/admin/cap-nhat-bai-viet/${b.id}`)}
                                                                >
                                                                    Sửa
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-danger"
                                                                    onClick={() => handleRequestDelete(b.id)}
                                                                    disabled={deletingId === b.id}
                                                                >
                                                                    {deletingId === b.id ? (
                                                                        <>
                                                                            <Spinner size="sm" animation="border" className="me-1" /> Đang xóa…
                                                                        </>
                                                                    ) : "Xóa"}
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

            {/* Confirm Delete Modal */}
            <Modal
                show={!!confirmId}
                onHide={() => setConfirmId(null)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xóa bài viết <strong>#{confirmId}</strong>? Hành động này không thể hoàn tác.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setConfirmId(null)}
                        disabled={deletingId === confirmId}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={deletingId === confirmId}
                    >
                        {deletingId === confirmId ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-1" /> Đang xóa…
                            </>
                        ) : "Xóa ngay"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast thông báo */}
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    bg={toast.variant === "danger" ? "danger" : "success"}
                    onClose={() => setToast(s => ({ ...s, show: false }))}
                    show={toast.show}
                    delay={2500}
                    autohide
                >
                    <Toast.Body className="text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}
