// src/pages/admin/products/ManagerProductBootstrap.jsx
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Table as RBTable,
    Button,
    Spinner,
    Alert,
    InputGroup,
    Form,
    Pagination as RBPagination,
    Collapse,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import productService from "../../../services/productService"; // chỉnh path nếu khác

const PAGE_SIZE = 10;

// Chuẩn hoá bỏ dấu + thường hoá
function normalizeVN(str = "") {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default function ManagerProductBootstrap() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState(search);
    const [deletingId, setDeletingId] = useState(null);

    // quản lý các hàng đang mở chi tiết
    const [expanded, setExpanded] = useState(() => new Set());
    const navigate = useNavigate();

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // fetch list
    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError("");
            const data = await productService.getAll();
            setProducts(Array.isArray(data) ? data : []);
            setPage(1);
        } catch (err) {
            console.error(err);
            setLoadError("Không tải được danh sách sản phẩm.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // lọc theo tên/giá/kho (bỏ dấu, không phân biệt hoa-thường)
    const filtered = useMemo(() => {
        if (!debounced.trim()) return products;
        const q = normalizeVN(debounced);
        return products.filter((p) => {
            const fields = [
                p?.name ?? "",
                p?.price != null ? String(p.price) : "",
                p?.originalPrice != null ? String(p.originalPrice) : "",
                p?.stock != null ? String(p.stock) : "",
            ];
            return fields.some((f) => normalizeVN(f).includes(q));
        });
    }, [products, debounced]);

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

    const toggleExpand = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDelete = useCallback(
        async (id, name) => {
            const ok = window.confirm(`Xác nhận xoá sản phẩm "${name}"?`);
            if (!ok) return;
            try {
                setDeletingId(id);
                await productService.deleteOne(id);
                setProducts((prev) => {
                    const next = prev.filter((p) => p.id !== id);
                    const nextFiltered = debounced
                        ? next.filter((p) => {
                            const fields = [
                                p?.name ?? "",
                                p?.price != null ? String(p.price) : "",
                                p?.originalPrice != null ? String(p.originalPrice) : "",
                                p?.stock != null ? String(p.stock) : "",
                            ];
                            return fields.some((f) => normalizeVN(f).includes(normalizeVN(debounced)));
                        })
                        : next;
                    const nextTotal = Math.max(1, Math.ceil(nextFiltered.length / PAGE_SIZE));
                    if (page > nextTotal) setPage(nextTotal);
                    return next;
                });
            } catch (err) {
                console.error(err);
                alert("Xoá thất bại");
            } finally {
                setDeletingId(null);
            }
        },
        [debounced, page]
    );

    // Component phân trang (Bootstrap)
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
                    Hiển thị <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> trong tổng số{" "}
                    <strong>{filtered.length}</strong> sản phẩm
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

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col sm={12}>
                    <Card>
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <Card.Title as="h5" className="mb-0">
                                Danh sách sản phẩm
                            </Card.Title>
                            <div className="d-flex align-items-center gap-2">
                                {/* Tìm kiếm */}
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Tìm theo tên/giá/kho..."
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
                                            title="Xoá tìm kiếm"
                                        >
                                            ×
                                        </Button>
                                    )}
                                </InputGroup>

                                <Button variant="outline-secondary" onClick={fetchProducts}>
                                    Làm mới
                                </Button>
                                <Button variant="primary" onClick={() => navigate("/admin/san-pham/them")}>
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
                                                    <th style={{ width: 56 }}></th>
                                                    <th>Tên sản phẩm</th>
                                                    <th className="text-end" style={{ width: 140 }}>
                                                        Giá hiện tại
                                                    </th>
                                                    <th className="text-end" style={{ width: 140 }}>
                                                        Giá gốc
                                                    </th>
                                                    <th className="text-end" style={{ width: 100 }}>
                                                        Kho
                                                    </th>
                                                    <th className="text-end" style={{ width: 180 }}>
                                                        Lệnh
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center text-muted py-4">
                                                            {products.length === 0
                                                                ? "Chưa có sản phẩm nào."
                                                                : "Không tìm thấy sản phẩm phù hợp."}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pageItems.map((p) => {
                                                        const isOpen = expanded.has(p.id);
                                                        return (
                                                            <Fragment key={p.id}>
                                                                <tr>
                                                                    <td className="text-start">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-secondary"
                                                                            onClick={() => toggleExpand(p.id)}
                                                                            aria-expanded={isOpen}
                                                                            title={isOpen ? "Thu gọn" : "Mở rộng"}
                                                                        >
                                                                            {isOpen ? "▴" : "▾"}
                                                                        </Button>
                                                                    </td>
                                                                    <td className="text-truncate">{p.name}</td>
                                                                    <td className="text-end">
                                                                        {p.price != null ? `${Number(p.price).toLocaleString()}₫` : "-"}
                                                                    </td>
                                                                    <td className="text-end">
                                                                        {p.originalPrice != null
                                                                            ? `${Number(p.originalPrice).toLocaleString()}₫`
                                                                            : "-"}
                                                                    </td>
                                                                    <td className="text-end">{p.stock ?? 0}</td>
                                                                    <td className="text-end">
                                                                        <div className="d-flex justify-content-end gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-secondary"
                                                                                onClick={() => navigate(`/admin/san-pham/sua/${p.id}`)}
                                                                            >
                                                                                Sửa
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-danger"
                                                                                disabled={deletingId === p.id}
                                                                                onClick={() => handleDelete(p.id, p.name)}
                                                                            >
                                                                                {deletingId === p.id ? (
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

                                                                {/* Hàng chi tiết: Collapse Bootstrap */}
                                                                <tr>
                                                                    <td colSpan={9999} className="p-0">
                                                                        <Collapse in={isOpen}>
                                                                            <div className="bg-light-subtle border-top">
                                                                                <div className="p-3">
                                                                                    <Row className="g-4">
                                                                                        <Col lg={6}>
                                                                                            <div className="fw-semibold mb-2">Màu sắc sản phẩm</div>
                                                                                            <div className="d-flex flex-wrap gap-2">
                                                                                                {p.productColors?.length ? (
                                                                                                    p.productColors.map((c, idx) => (
                                                                                                        <div key={idx} className="d-flex align-items-center gap-2">
                                                                                                            <span
                                                                                                                className="d-inline-block rounded border"
                                                                                                                style={{
                                                                                                                    width: 20,
                                                                                                                    height: 20,
                                                                                                                    backgroundColor: c.codeColor,
                                                                                                                    borderColor: "rgba(0,0,0,.1)",
                                                                                                                }}
                                                                                                            />
                                                                                                            <span className="small text-body">{c.colorName}</span>
                                                                                                        </div>
                                                                                                    ))
                                                                                                ) : (
                                                                                                    <span className="small text-secondary">Chưa cấu hình màu.</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </Col>

                                                                                        <Col lg={6}>
                                                                                            <div className="fw-semibold mb-2">Kích thước &amp; Tồn kho</div>
                                                                                            <div className="table-responsive rounded border">
                                                                                                <table className="table table-sm mb-0">
                                                                                                    <thead className="table-light">
                                                                                                        <tr>
                                                                                                            <th style={{ width: "60%" }}>Kích thước</th>
                                                                                                            <th className="text-end">Tồn</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {p.productSizes?.length ? (
                                                                                                            p.productSizes.map((s) => (
                                                                                                                <tr key={s.sizeId}>
                                                                                                                    <td>{s.sizeName}</td>
                                                                                                                    <td className="text-end">{s.stock}</td>
                                                                                                                </tr>
                                                                                                            ))
                                                                                                        ) : (
                                                                                                            <tr>
                                                                                                                <td colSpan={2} className="text-secondary">
                                                                                                                    Chưa cấu hình kích thước.
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        )}
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </div>
                                                                            </div>
                                                                        </Collapse>
                                                                    </td>
                                                                </tr>
                                                            </Fragment>
                                                        );
                                                    })
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
