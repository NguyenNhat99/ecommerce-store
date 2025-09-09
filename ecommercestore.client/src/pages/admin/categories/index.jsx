// src/pages/admin/categories/ManagerCategoryBootstrap.jsx
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
} from "react-bootstrap";
import categoryService from "../../../services/categoryService"; // chỉnh path cho khớp dự án

const PAGE_SIZE = 10;

// Chuẩn hoá bỏ dấu + thường hoá (tương tự norm trong code Tailwind)
function normalizeVN(str = "") {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default function ManagerCategoryBootstrap() {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // search + debounce
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState(search);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // null = thêm mới
    const [form, setForm] = useState({ categoryName: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const openAdd = useCallback(() => {
        setEditing(null);
        setForm({ categoryName: "", description: "" });
        setShowModal(true);
    }, []);

    const openEdit = useCallback((cat) => {
        setEditing(cat);
        setForm({
            categoryName: cat?.categoryName ?? "",
            description: cat?.description ?? "",
        });
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setEditing(null);
        setForm({ categoryName: "", description: "" });
    }, []);

    // fetch data
    const fetchCategory = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError("");
            const data = await categoryService.getAll();
            setCategories(Array.isArray(data) ? data : []);
            setPage(1);
        } catch (err) {
            console.error(err);
            setLoadError("Không tải được danh sách danh mục.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    // lọc theo tên danh mục
    const filtered = useMemo(() => {
        if (!debounced.trim()) return categories;
        const q = normalizeVN(debounced);
        return categories.filter((c) => normalizeVN(c?.categoryName ?? "").includes(q));
    }, [categories, debounced]);

    // phân trang
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

    // thêm / sửa
    const handleSubmit = useCallback(async () => {
        if (!form.categoryName.trim()) {
            alert("Vui lòng nhập tên danh mục");
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await categoryService.updateOne(editing.id, {
                    categoryName: form.categoryName.trim(),
                    description: form.description.trim(),
                });
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === editing.id
                            ? {
                                ...c,
                                categoryName: form.categoryName.trim(),
                                description: form.description.trim(),
                            }
                            : c
                    )
                );
            } else {
                const created = await categoryService.createOne({
                    categoryName: form.categoryName.trim(),
                    description: form.description.trim(),
                });
                if (created && created.id != null) {
                    setCategories((prev) => [created, ...prev]);
                    setPage(1);
                    setSearch("");
                } else {
                    await fetchCategory();
                }
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Lưu thất bại");
        } finally {
            setSubmitting(false);
        }
    }, [editing, form, fetchCategory, closeModal]);

    // xoá
    const handleDelete = useCallback(
        async (id) => {
            const ok = window.confirm("Bạn có chắc muốn xoá danh mục này?");
            if (!ok) return;
            try {
                setDeletingId(id);
                await categoryService.deleteOne(id);
                setCategories((prev) => {
                    const next = prev.filter((c) => c.id !== id);
                    const nextFiltered = debounced
                        ? next.filter((c) =>
                            normalizeVN(c?.categoryName ?? "").includes(normalizeVN(debounced))
                        )
                        : next;
                    const nextTotalPages = Math.max(1, Math.ceil(nextFiltered.length / PAGE_SIZE));
                    if (page > nextTotalPages) setPage(nextTotalPages);
                    return next;
                });
            } catch (err) {
                console.error(err);
                alert("Xoá thất bại");
            } finally {
                setDeletingId(null);
            }
        },
        [page, debounced]
    );

    // Component phân trang (Bootstrap)
    const Pagination = () => {
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <RBPagination.Item
                    key={i}
                    active={i === page}
                    onClick={() => handleChangePage(i)}
                >
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
                    trong tổng số <strong>{filtered.length}</strong> danh mục
                </div>
                <RBPagination className="mb-0">
                    <RBPagination.Prev
                        disabled={page === 1}
                        onClick={() => handleChangePage(page - 1)}
                    />
                    {items}
                    <RBPagination.Next
                        disabled={page === totalPages}
                        onClick={() => handleChangePage(page + 1)}
                    />
                </RBPagination>
            </div>
        );
    };

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <Card.Title as="h5" className="mb-0">
                                Danh sách danh mục
                            </Card.Title>

                            <div className="d-flex align-items-center gap-2">
                                {/* ô tìm kiếm */}
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Tìm theo tên danh mục..."
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

                                <Button variant="outline-secondary" onClick={fetchCategory}>
                                    Làm mới
                                </Button>
                                <Button variant="primary" onClick={openAdd}>
                                    + Thêm
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
                                <Alert variant="danger" className="mb-0">
                                    {loadError}
                                </Alert>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <RBTable hover className="align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 80 }}>Id</th>
                                                    <th>Tên danh mục</th>
                                                    <th>Mô tả</th>
                                                    <th style={{ width: 180 }}>Lệnh</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center text-muted py-4">
                                                            {categories.length === 0
                                                                ? "Chưa có danh mục nào."
                                                                : "Không tìm thấy danh mục phù hợp."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pageItems.map((c) => (
                                                        <tr key={c.id}>
                                                            <td>{c.id}</td>
                                                            <td>{c.categoryName}</td>
                                                            <td className="text-break">{c.description}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-secondary"
                                                                        onClick={() => openEdit(c)}
                                                                    >
                                                                        Sửa
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-danger"
                                                                        disabled={deletingId === c.id}
                                                                        onClick={() => handleDelete(c.id)}
                                                                    >
                                                                        {deletingId === c.id ? (
                                                                            <>
                                                                                <Spinner
                                                                                    animation="border"
                                                                                    size="sm"
                                                                                    className="me-1"
                                                                                />
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

                                    <Pagination />
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal thêm / sửa */}
            <Modal show={showModal} onHide={closeModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? "Sửa danh mục" : "Thêm danh mục"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                    >
                        <Form.Group className="mb-3" controlId="categoryName">
                            <Form.Label>Tên danh mục</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên danh mục"
                                value={form.categoryName}
                                onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                                autoFocus
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="categoryDesc">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Mô tả (không bắt buộc)"
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, description: e.target.value }))
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={closeModal}>
                        Đóng
                    </Button>
                    <Button variant="primary" disabled={submitting} onClick={handleSubmit}>
                        {submitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Đang lưu...
                            </>
                        ) : editing ? (
                            "Cập nhật"
                        ) : (
                            "Thêm"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
