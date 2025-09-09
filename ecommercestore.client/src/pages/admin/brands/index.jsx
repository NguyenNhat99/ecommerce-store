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
import brandService from "../../../services/brandService"; // giữ nguyên path của bạn

const PAGE_SIZE = 10;

function normalizeVN(str = "") {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export default function ManagerBrandBootstrap() {
    const [brands, setBrands] = useState([]);
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
    const [form, setForm] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const openAdd = useCallback(() => {
        setEditing(null);
        setForm({ name: "", description: "" });
        setShowModal(true);
    }, []);

    const openEdit = useCallback((brand) => {
        setEditing(brand);
        setForm({
            name: brand?.name ?? "",
            description: brand?.description ?? "",
        });
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: "", description: "" });
    }, []);

    // fetch data
    const fetchBrand = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError("");
            const data = await brandService.getAll();
            setBrands(Array.isArray(data) ? data : []);
            setPage(1);
        } catch (err) {
            console.error(err);
            setLoadError("Không tải được danh sách thương hiệu.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrand();
    }, [fetchBrand]);

    // filter theo tên (không dấu)
    const filtered = useMemo(() => {
        if (!debounced.trim()) return brands;
        const q = normalizeVN(debounced);
        return brands.filter((b) => normalizeVN(b?.name ?? "").includes(q));
    }, [brands, debounced]);

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
        if (!form.name.trim()) {
            alert("Vui lòng nhập tên thương hiệu");
            return;
        }
        setSubmitting(true);
        try {
            if (editing) {
                await brandService.updateOne(editing.id, {
                    name: form.name.trim(),
                    description: form.description.trim(),
                });
                setBrands((prev) =>
                    prev.map((b) =>
                        b.id === editing.id
                            ? {
                                ...b,
                                name: form.name.trim(),
                                description: form.description.trim(),
                            }
                            : b
                    )
                );
            } else {
                const created = await brandService.createOne({
                    name: form.name.trim(),
                    description: form.description.trim(),
                });
                if (created && created.id != null) {
                    setBrands((prev) => [created, ...prev]);
                    setPage(1);
                    setSearch("");
                } else {
                    await fetchBrand();
                }
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Lưu thất bại");
        } finally {
            setSubmitting(false);
        }
    }, [editing, form, fetchBrand, closeModal]);

    // xoá
    const handleDelete = useCallback(
        async (id) => {
            const ok = window.confirm("Bạn có chắc muốn xoá thương hiệu này?");
            if (!ok) return;
            try {
                setDeletingId(id);
                await brandService.deleteOne(id);
                setBrands((prev) => {
                    const next = prev.filter((b) => b.id !== id);
                    const nextFiltered = debounced
                        ? next.filter((b) =>
                            normalizeVN(b?.name ?? "").includes(normalizeVN(debounced))
                        )
                        : next;
                    const nextTotalPages = Math.max(
                        1,
                        Math.ceil(nextFiltered.length / PAGE_SIZE)
                    );
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
                    trong tổng số <strong>{filtered.length}</strong> thương hiệu
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
                                Danh sách thương hiệu
                            </Card.Title>

                            <div className="d-flex align-items-center gap-2">
                                {/* ô tìm kiếm */}
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Tìm theo tên thương hiệu..."
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

                                <Button variant="outline-secondary" onClick={fetchBrand}>
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
                                                    <th>Tên thương hiệu</th>
                                                    <th>Mô tả</th>
                                                    <th style={{ width: 180 }}>Lệnh</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-center text-muted py-4">
                                                            {brands.length === 0
                                                                ? "Chưa có thương hiệu nào."
                                                                : "Không tìm thấy thương hiệu phù hợp."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pageItems.map((b) => (
                                                        <tr key={b.id}>
                                                            <td>{b.id}</td>
                                                            <td>{b.name}</td>
                                                            <td className="text-break">{b.description}</td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-secondary"
                                                                        onClick={() => openEdit(b)}
                                                                    >
                                                                        Sửa
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline-danger"
                                                                        disabled={deletingId === b.id}
                                                                        onClick={() => handleDelete(b.id)}
                                                                    >
                                                                        {deletingId === b.id ? (
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
                    <Modal.Title>{editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                    >
                        <Form.Group className="mb-3" controlId="brandName">
                            <Form.Label>Tên</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên thương hiệu"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                autoFocus
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="brandDesc">
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
