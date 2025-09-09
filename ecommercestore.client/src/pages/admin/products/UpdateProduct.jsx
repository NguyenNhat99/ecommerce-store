// src/pages/admin/products/UpdateProductBootstrap.jsx
import { useEffect, useMemo, useState } from "react";
import {
    Container, Row, Col, Card, Form, Button, Spinner, InputGroup, Alert, Badge
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import brandService from "../../../services/brandService";
import categoryService from "../../../services/categoryService";
import productService from "../../../services/productService";

const MAX_IMAGES = 10;
const ASSET_BASE = "https://localhost:7235/assets/products/";
const fileKey = (f) => `${f.name}_${f.size}_${f.lastModified}`;

// Chuẩn hoá URL ảnh: nếu là relative thì ghép base, nếu đã là full URL (http/https) thì giữ nguyên
const buildAssetUrl = (u) => {
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `${ASSET_BASE}${String(u).replace(/^\/+/, "")}`;
};

export default function UpdateProductBootstrap() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        stock: "",
        sizeConversion: "",
        categoryId: "",
        brandId: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState({
        categories: true,
        brands: true,
        page: true,
        submitting: false,
    });

    // options
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // sizes & colors
    const [productSizes, setProductSizes] = useState([]);   // [{sizeName, stock}]
    const [productColors, setProductColors] = useState([]); // ["#RRGGBB", ...]

    // avatar (cũ + mới)
    const [existingAvatar, setExistingAvatar] = useState(""); // string (filename/relative/full url)
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    // images (cũ hiển thị; mới thêm)
    const [existingImages, setExistingImages] = useState([]); // string[]
    const [newImages, setNewImages] = useState([]);           // File[]
    const [newImagePreviews, setNewImagePreviews] = useState([]); // string[]
    const [imagesInputKey, setImagesInputKey] = useState(0);

    // ===== Load dữ liệu ban đầu =====
    useEffect(() => {
        (async () => {
            try {
                const [cats, brs, product] = await Promise.all([
                    categoryService.getAll(),
                    brandService.getAll(),
                    productService.getOne(id),
                ]);

                setCategories(cats || []);
                setBrands(brs || []);

                // Prefill form
                setForm({
                    name: product?.name ?? "",
                    description: product?.description ?? "",
                    price: product?.price ?? "",
                    originalPrice: product?.originalPrice ?? "",
                    stock: product?.stock ?? "",
                    sizeConversion: product?.sizeConversion ?? "",
                    categoryId: product?.categoryId ?? "",
                    brandId: product?.brandId ?? "",
                });

                // Avatar + ảnh
                setExistingAvatar(product?.avatar || "");
                setExistingImages((product?.images || []).map((x) => x.imageUrl));

                // Colors
                setProductColors((product?.productColors || []).map((p) => p.codeColor));

                // Sizes
                setProductSizes(
                    (product?.productSizes || []).map((s) => ({
                        sizeName: s.sizeName,
                        stock: s.stock,
                    }))
                );
            } catch (e) {
                console.error(e);
                alert("Lỗi tải dữ liệu sản phẩm.");
            } finally {
                setLoading((s) => ({ ...s, categories: false, brands: false, page: false }));
            }
        })();
    }, [id]);

    const categoryOptions = useMemo(
        () => [{ value: "", label: "Chọn danh mục" }, ...categories.map((c) => ({ value: c.id, label: c.categoryName }))],
        [categories]
    );
    const brandOptions = useMemo(
        () => [{ value: "", label: "Chọn thương hiệu" }, ...brands.map((b) => ({ value: b.id, label: b.name }))],
        [brands]
    );

    // ===== Helpers =====
    const setField = (key) => (eOrValue) => {
        const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((er) => ({ ...er, [key]: undefined }));
    };

    const handleAvatarChange = (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setPreviewAvatar((old) => {
            if (old) URL.revokeObjectURL(old);
            return URL.createObjectURL(file);
        });
        setErrors((er) => ({ ...er, avatar: undefined }));
    };

    useEffect(() => {
        // cleanup previews cũ
        newImagePreviews.forEach((u) => URL.revokeObjectURL(u));
        const urls = newImages.map((f) => URL.createObjectURL(f));
        setNewImagePreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newImages]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleImagesAdd = (e) => {
        const files = Array.from(e?.target?.files || []);
        if (!files.length) return;
        const map = new Map(newImages.map((f) => [fileKey(f), f]));
        for (const f of files) {
            const k = fileKey(f);
            if (!map.has(k)) map.set(k, f);
        }
        setNewImages(Array.from(map.values()).slice(0, MAX_IMAGES));
        setImagesInputKey((k) => k + 1); // reset input
    };
    const removeNewImageAt = (idx) => setNewImages((arr) => arr.filter((_, i) => i !== idx));

    // sizes
    const addSize = () => setProductSizes((arr) => [...arr, { sizeName: "", stock: "" }]);
    const removeSize = (idx) => setProductSizes((arr) => arr.filter((_, i) => i !== idx));
    const changeSize = (idx, field) => (e) => {
        const val = e?.target?.value ?? "";
        setProductSizes((arr) => {
            const next = [...arr];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
    };

    // colors
    const addColor = () => setProductColors((arr) => [...arr, "#000000"]);
    const removeColor = (idx) => setProductColors((arr) => arr.filter((_, i) => i !== idx));
    const changeColor = (idx) => (e) => {
        const val = e?.target?.value ?? "#000000";
        setProductColors((arr) => {
            const next = [...arr];
            next[idx] = val;
            return next;
        });
    };

    // ===== Validate (update) =====
    const validate = () => {
        const er = {};
        if (!form.name?.trim()) er.name = "Vui lòng nhập tên sản phẩm";
        if (!form.description?.trim()) er.description = "Vui lòng nhập mô tả";
        if (!form.sizeConversion?.trim()) er.sizeConversion = "Không được bỏ trống";
        if (!form.price || Number(form.price) <= 0) er.price = "Giá sản phẩm phải lớn hơn 0";
        if (!form.originalPrice || Number(form.originalPrice) <= 0) er.originalPrice = "Giá gốc phải lớn hơn 0";
        if (form.stock === "" || Number(form.stock) < 0) er.stock = "Số lượng không hợp lệ";
        if (!form.categoryId) er.categoryId = "Vui lòng chọn danh mục";
        if (!form.brandId) er.brandId = "Vui lòng chọn thương hiệu";
        if (!existingAvatar && !avatarFile) er.avatar = "Vui lòng chọn ảnh đại diện";
        setErrors(er);
        return Object.keys(er).length === 0;
    };

    // ===== Submit cập nhật =====
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading((s) => ({ ...s, submitting: true }));

            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("description", form.description);
            fd.append("price", form.price);
            fd.append("originalPrice", form.originalPrice);
            fd.append("stock", form.stock);
            fd.append("sizeConversion", form.sizeConversion);
            fd.append("categoryId", form.categoryId);
            fd.append("brandId", form.brandId);

            // chỉ gửi avatar nếu có ảnh mới
            if (avatarFile) fd.append("avatar", avatarFile);

            // thêm ảnh mới; ảnh cũ vẫn giữ (xóa ảnh cũ nếu API riêng hỗ trợ)
            newImages.forEach((f) => fd.append("images", f));

            // màu & size
            productColors.forEach((hex) => fd.append("colorCodes", hex));
            productSizes.forEach((sz, i) => {
                if (sz.sizeName) fd.append(`ProductSizes[${i}].SizeName`, sz.sizeName);
                fd.append(`ProductSizes[${i}].Stock`, sz.stock || 0);
            });

            await productService.updateOne(id, fd);
            alert("Cập nhật sản phẩm thành công!");
            navigate("/admin/san-pham");
        } catch (err) {
            console.error(err);
            alert(`Lỗi cập nhật sản phẩm: ${err?.message || err}`);
        } finally {
            setLoading((s) => ({ ...s, submitting: false }));
        }
    };

    if (loading.page) {
        return (
            <Container fluid className="py-3">
                <Card><Card.Body>Đang tải dữ liệu sản phẩm...</Card.Body></Card>
            </Container>
        );
    }

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col lg={12}>
                    <Card>
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <Card.Title as="h5" className="mb-0">Cập nhật sản phẩm</Card.Title>
                            <div className="d-flex gap-2">
                                <Button variant="outline-secondary" onClick={() => navigate(-1)}>Quay lại</Button>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                {/* Tên + Mô tả */}
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group controlId="pdName">
                                            <Form.Label>Tên sản phẩm</Form.Label>
                                            <Form.Control
                                                placeholder="Nhập tên sản phẩm"
                                                value={form.name}
                                                onChange={setField("name")}
                                                isInvalid={!!errors.name}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="pdSizeConv">
                                            <Form.Label>Size Conversion</Form.Label>
                                            <Form.Control
                                                placeholder="Size conversion"
                                                value={form.sizeConversion}
                                                onChange={setField("sizeConversion")}
                                                isInvalid={!!errors.sizeConversion}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.sizeConversion}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group controlId="pdDesc">
                                            <Form.Label>Mô tả</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                placeholder="Mô tả sản phẩm"
                                                value={form.description}
                                                onChange={setField("description")}
                                                isInvalid={!!errors.description}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Giá / Kho / Danh mục / Thương hiệu */}
                                <Row className="g-3 mt-1">
                                    <Col xl={3} md={6}>
                                        <Form.Group controlId="pdPrice">
                                            <Form.Label>Giá hiện tại</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Giá hiện tại"
                                                    value={form.price}
                                                    onChange={setField("price")}
                                                    isInvalid={!!errors.price}
                                                    min={0}
                                                />
                                                <InputGroup.Text>đ</InputGroup.Text>
                                                <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xl={3} md={6}>
                                        <Form.Group controlId="pdOriginalPrice">
                                            <Form.Label>Giá gốc</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Giá gốc"
                                                    value={form.originalPrice}
                                                    onChange={setField("originalPrice")}
                                                    isInvalid={!!errors.originalPrice}
                                                    min={0}
                                                />
                                                <InputGroup.Text>đ</InputGroup.Text>
                                                <Form.Control.Feedback type="invalid">{errors.originalPrice}</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col xl={3} md={6}>
                                        <Form.Group controlId="pdStock">
                                            <Form.Label>Tổng số lượng</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="Số lượng"
                                                value={form.stock}
                                                onChange={setField("stock")}
                                                isInvalid={!!errors.stock}
                                                min={0}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col xl={3} md={6}>
                                        <Form.Group controlId="pdCategory">
                                            <Form.Label>Danh mục</Form.Label>
                                            <Form.Select
                                                value={form.categoryId}
                                                onChange={(e) => {
                                                    setForm((f) => ({ ...f, categoryId: e.target.value }));
                                                    setErrors((er) => ({ ...er, categoryId: undefined }));
                                                }}
                                                disabled={loading.categories}
                                                isInvalid={!!errors.categoryId}
                                            >
                                                {categoryOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.categoryId}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col xl={3} md={6}>
                                        <Form.Group controlId="pdBrand" className="mt-xl-0 mt-2">
                                            <Form.Label>Thương hiệu</Form.Label>
                                            <Form.Select
                                                value={form.brandId}
                                                onChange={(e) => {
                                                    setForm((f) => ({ ...f, brandId: e.target.value }));
                                                    setErrors((er) => ({ ...er, brandId: undefined }));
                                                }}
                                                disabled={loading.brands}
                                                isInvalid={!!errors.brandId}
                                            >
                                                {brandOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.brandId}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Ảnh đại diện */}
                                <Card className="mt-3">
                                    <Card.Header><strong>Ảnh đại diện</strong></Card.Header>
                                    <Card.Body>
                                        <Form.Group controlId="pdAvatar">
                                            <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} isInvalid={!!errors.avatar} />
                                            <Form.Control.Feedback type="invalid">{errors.avatar}</Form.Control.Feedback>
                                        </Form.Group>

                                        {(previewAvatar || existingAvatar) && (
                                            <div className="mt-3">
                                                <img
                                                    src={previewAvatar || buildAssetUrl(existingAvatar)}
                                                    alt="preview-avatar"
                                                    className="rounded shadow-sm"
                                                    style={{ width: 160, height: 160, objectFit: "cover" }}
                                                />
                                                {!previewAvatar && existingAvatar && (
                                                    <div className="text-muted small mt-1">
                                                        Đang dùng ảnh cũ. Chọn ảnh mới để thay thế.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* Ảnh sản phẩm */}
                                <Card className="mt-3">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <strong>Ảnh sản phẩm</strong>
                                        <Badge bg="secondary">{newImages.length}/{MAX_IMAGES} ảnh mới</Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        {/* Ảnh hiện có (chỉ xem) */}
                                        {existingImages?.length > 0 && (
                                            <>
                                                <div className="text-muted small mb-2">Ảnh hiện có:</div>
                                                <Row xs={3} sm={4} md={6} className="g-2 mb-2">
                                                    {existingImages.map((url, i) => (
                                                        <Col key={`${url}-${i}`}>
                                                            <div className="ratio ratio-4x3 border rounded">
                                                                <img src={buildAssetUrl(url)} alt={`old-${i}`} style={{ objectFit: "cover" }} />
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                                <div className="text-muted small mb-3">
                                                    Ảnh cũ vẫn được giữ. (Nếu cần xoá ảnh cũ, thêm API xoá ảnh riêng.)
                                                </div>
                                            </>
                                        )}

                                        {/* Thêm ảnh mới */}
                                        <Form.Group>
                                            <Form.Control
                                                key={imagesInputKey}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImagesAdd}
                                            />
                                        </Form.Group>

                                        {newImages.length > 0 && (
                                            <Row xs={2} sm={3} md={4} className="g-3 mt-1">
                                                {newImagePreviews.map((url, i) => (
                                                    <Col key={url}>
                                                        <Card className="h-100">
                                                            <div className="ratio ratio-4x3">
                                                                <img src={url} alt={`new-${i}`} style={{ objectFit: "cover" }} />
                                                            </div>
                                                            <Card.Body className="d-flex justify-content-between">
                                                                <Button size="sm" variant="outline-danger" onClick={() => removeNewImageAt(i)}>Xóa</Button>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        )}
                                    </Card.Body>
                                </Card>

                                {/* Kích thước & tồn */}
                                <Card className="mt-3">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <strong>Kích thước & số lượng tồn</strong>
                                        <Button variant="primary" size="sm" type="button" onClick={addSize}>+ Thêm kích thước</Button>
                                    </Card.Header>
                                    <Card.Body>
                                        {productSizes.length === 0 && (
                                            <Alert variant="secondary" className="py-2 mb-3">Chưa có kích thước.</Alert>
                                        )}
                                        {productSizes.map((sz, idx) => (
                                            <Row key={idx} className="g-2 align-items-end mb-2">
                                                <Col md={6}>
                                                    <Form.Control
                                                        placeholder={`Tên kích thước ${idx + 1}`}
                                                        value={sz.sizeName}
                                                        onChange={changeSize(idx, "sizeName")}
                                                    />
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Số lượng tồn"
                                                        value={sz.stock}
                                                        onChange={changeSize(idx, "stock")}
                                                    />
                                                </Col>
                                                <Col md={2} className="text-md-end">
                                                    <Button variant="outline-danger" type="button" onClick={() => removeSize(idx)}>Xóa</Button>
                                                </Col>
                                            </Row>
                                        ))}
                                    </Card.Body>
                                </Card>

                                {/* Màu sắc */}
                                <Card className="mt-3">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <strong>Màu sắc sản phẩm</strong>
                                        <Button variant="primary" size="sm" type="button" onClick={addColor}>+ Thêm màu</Button>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="g-3">
                                            {productColors.map((color, idx) => (
                                                <Col key={idx} md={4} lg={3}>
                                                    <div className="d-flex align-items-center gap-3 border rounded p-2">
                                                        <Form.Control type="color" value={color} onChange={changeColor(idx)} style={{ width: 70, height: 40, padding: 0 }} />
                                                        <div className="small">Mã màu: <strong>{String(color).toUpperCase()}</strong></div>
                                                        <Button variant="outline-danger" size="sm" type="button" onClick={() => removeColor(idx)}>Xóa</Button>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Submit */}
                                <div className="d-flex gap-2 mt-3">
                                    <Button type="submit" disabled={loading.submitting}>
                                        {loading.submitting ? (<><Spinner size="sm" className="me-2" />Đang lưu...</>) : "Cập nhật sản phẩm"}
                                    </Button>
                                    <Button type="button" variant="outline-secondary" onClick={() => navigate("/admin/san-pham")}>
                                        Hủy
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
