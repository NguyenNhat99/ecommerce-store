import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Container, Row, Col, Card, Form, Button, Spinner, Alert
} from "react-bootstrap";
import blogService from "@/services/blogService";

// util: tạo slug từ tiêu đề
const slugify = (s = "") =>
    s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export default function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        isPublished: false,
    });
    const [thumbFile, setThumbFile] = useState(null);
    const [thumbPreview, setThumbPreview] = useState(null);   // objectURL
    const [thumbExisting, setThumbExisting] = useState("");   // url hiện có từ BE

    const [loading, setLoading] = useState({ init: true, submitting: false });
    const [err, setErr] = useState("");
    const [errors, setErrors] = useState({});

    // load bài viết
    useEffect(() => {
        (async () => {
            try {
                setLoading((s) => ({ ...s, init: true }));
                setErr("");
                const data = await blogService.getOne(id);
                setForm({
                    title: data?.title ?? "",
                    slug: data?.slug ?? "",
                    content: data?.content ?? "",
                    isPublished: !!data?.isPublished,
                });
                setThumbExisting(data?.thumbnailUrl || data?.thumbnail || "");
            } catch (e) {
                console.error(e);
                setErr("Không tải được bài viết.");
            } finally {
                setLoading((s) => ({ ...s, init: false }));
            }
        })();
    }, [id]);

    const setField = (key) => (e) => {
        const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((er) => ({ ...er, [key]: undefined }));
    };

    // auto slug theo title nếu người dùng chưa sửa tay
    useEffect(() => {
        setForm((f) => {
            // nếu slug đang trống hoặc đang bám sát title cũ, tự sinh
            const auto = slugify(f.title);
            if (!f.slug || f.slug === slugify(f.slug)) return { ...f, slug: auto };
            return f;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.title]);

    // chọn thumbnail
    const onThumbChange = (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;
        setThumbFile(file);
        if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        setThumbPreview(URL.createObjectURL(file));
        setErrors((er) => ({ ...er, thumbnail: undefined }));
    };

    // validate
    const validate = () => {
        const er = {};
        if (!form.title?.trim()) er.title = "Vui lòng nhập tiêu đề";
        if (!form.slug?.trim()) er.slug = "Vui lòng nhập slug";
        if (!form.content?.trim()) er.content = "Vui lòng nhập nội dung";
        // thumbnail KHÔNG bắt buộc khi cập nhật; nếu muốn bắt buộc khi tạo mới thì check ở trang create
        setErrors(er);
        return Object.keys(er).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setLoading((s) => ({ ...s, submitting: true }));
            const fd = new FormData();
            fd.append("Title", form.title);
            fd.append("Slug", form.slug);
            fd.append("Content", form.content);
            fd.append("IsPublished", String(form.isPublished));

            // chỉ gửi file nếu người dùng chọn ảnh mới
            if (thumbFile) fd.append("Thumbnail", thumbFile);

            await blogService.update(id, fd);
            alert("Cập nhật bài viết thành công!");
            navigate("/admin/quan-ly-bai-viet");
        } catch (e) {
            console.error(e);
            alert("Cập nhật thất bại.");
        } finally {
            setLoading((s) => ({ ...s, submitting: false }));
        }
    };

    // cleanup objectURL
    useEffect(() => {
        return () => {
            if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        };
    }, [thumbPreview]);

    if (loading.init) {
        return (
            <Container fluid className="py-3">
                <Row><Col>
                    <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" /> <span>Đang tải…</span>
                    </div>
                </Col></Row>
            </Container>
        );
    }

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col lg={12}>
                    <Card>
                        <Card.Header className="d-flex align-items-center justify-content-between">
                            <Card.Title as="h5" className="mb-0">Cập nhật bài viết</Card.Title>
                            <div className="d-flex gap-2">
                                <Button size="sm" variant="outline-secondary" onClick={() => navigate(-1)}>
                                    Quay lại
                                </Button>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            {err && <Alert variant="danger">{err}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group controlId="blogTitle">
                                            <Form.Label>Tiêu đề</Form.Label>
                                            <Form.Control
                                                value={form.title}
                                                onChange={setField("title")}
                                                isInvalid={!!errors.title}
                                                placeholder="Nhập tiêu đề"
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="blogSlug">
                                            <Form.Label>Slug</Form.Label>
                                            <Form.Control
                                                value={form.slug}
                                                onChange={setField("slug")}
                                                isInvalid={!!errors.slug}
                                                placeholder="my-bai-viet"
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group controlId="blogContent">
                                            <Form.Label>Nội dung</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={6}
                                                value={form.content}
                                                onChange={setField("content")}
                                                isInvalid={!!errors.content}
                                                placeholder="Nhập nội dung…"
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.content}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Thumbnail */}
                                <Card className="mt-3">
                                    <Card.Header><strong>Ảnh thumbnail</strong></Card.Header>
                                    <Card.Body>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group controlId="blogThumb">
                                                    <Form.Control type="file" accept="image/*" onChange={onThumbChange} isInvalid={!!errors.thumbnail} />
                                                    <Form.Control.Feedback type="invalid">{errors.thumbnail}</Form.Control.Feedback>
                                                    <div className="form-text">Không chọn ảnh mới thì giữ nguyên ảnh hiện tại.</div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="d-flex gap-3">
                                                {thumbPreview ? (
                                                    <div>
                                                        <div className="text-muted small mb-1">Xem trước ảnh mới</div>
                                                        <img
                                                            src={thumbPreview}
                                                            alt="preview-thumb"
                                                            className="rounded border"
                                                            style={{ width: 180, height: 120, objectFit: "cover" }}
                                                        />
                                                    </div>
                                                ) : thumbExisting ? (
                                                    <div>
                                                        <div className="text-muted small mb-1">Ảnh hiện tại</div>
                                                        <img
                                                            src={thumbExisting}
                                                            alt="current-thumb"
                                                            className="rounded border"
                                                            style={{ width: 180, height: 120, objectFit: "cover" }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-muted">Chưa có ảnh.</div>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Form.Group className="mb-3">
                                    <input
                                        id="blog-visible"
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, isPublished: e.target.checked }))
                                        }
                                        style={{ width: 18, height: 18, cursor: "pointer" }}
                                    />
                                    <label htmlFor="blog-visible" style={{ marginLeft: "8px", cursor: "pointer" }}>
                                        Hiển thị
                                    </label>
                                </Form.Group>




                                <div className="d-flex gap-2 mt-3">
                                    <Button type="submit" disabled={loading.submitting}>
                                        {loading.submitting ? (<><Spinner size="sm" className="me-2" />Đang lưu…</>) : "Lưu thay đổi"}
                                    </Button>
                                    <Button type="button" variant="outline-secondary" onClick={() => navigate("/admin/blogs")}>
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
