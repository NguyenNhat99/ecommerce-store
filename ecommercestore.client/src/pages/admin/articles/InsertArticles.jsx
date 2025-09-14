// src/pages/admin/blogs/InsertArticles.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import blogService from "@/services/blogService";

const InsertArticles = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        content: "",
        isVisible: true, // UI: Hiển thị
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbPreview, setThumbPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const setField = (key) => (e) => {
        const value = e?.target?.value ?? "";
        setForm((f) => ({ ...f, [key]: value }));
        setErrors((er) => ({ ...er, [key]: undefined }));
    };

    const onThumbChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setThumbnailFile(f);
        setThumbPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(f);
        });
        setErrors((er) => ({ ...er, thumbnailFile: undefined }));
    };

    useEffect(() => () => { if (thumbPreview) URL.revokeObjectURL(thumbPreview); }, [thumbPreview]);

    const validate = () => {
        const er = {};
        if (!form.title?.trim()) er.title = "Vui lòng nhập tiêu đề";
        if (!form.content?.trim()) er.content = "Vui lòng nhập nội dung";
        if (!thumbnailFile) er.thumbnailFile = "Vui lòng chọn ảnh thumbnail";
        setErrors(er);
        return Object.keys(er).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const fd = new FormData();
            fd.append("Title", form.title);
            fd.append("Content", form.content);
            // Map "Hiển thị" -> IsPublished của BE
            fd.append("IsPublished", form.isVisible ? "true" : "false");
            if (thumbnailFile) fd.append("ThumbnailFile", thumbnailFile);

            await blogService.create(fd);
            alert("Thêm bài viết thành công!");
            navigate("/admin/quan-ly-bai-viet");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Có lỗi khi thêm bài viết!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="py-3">
            <Row className="gy-4 gx-4">
                <Col lg={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title as="h5" className="mb-0">Thêm bài viết</Card.Title>
                            <Button variant="outline-secondary" onClick={() => navigate(-1)}>Quay lại</Button>
                        </Card.Header>

                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tiêu đề</Form.Label>
                                    <Form.Control
                                        value={form.title}
                                        onChange={setField("title")}
                                        isInvalid={!!errors.title}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Nội dung</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={6}
                                        value={form.content}
                                        onChange={setField("content")}
                                        isInvalid={!!errors.content}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.content}</Form.Control.Feedback>
                                </Form.Group>

                                <Card className="mb-3">
                                    <Card.Header><strong>Thumbnail</strong></Card.Header>
                                    <Card.Body>
                                        <Form.Group>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={onThumbChange}
                                                isInvalid={!!errors.thumbnailFile}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.thumbnailFile}</Form.Control.Feedback>
                                        </Form.Group>
                                        {thumbPreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={thumbPreview}
                                                    alt="thumb"
                                                    className="rounded border"
                                                    style={{ width: 240, height: 150, objectFit: "cover" }}
                                                />
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>

                                <Form.Group className="mb-3">
                                    <input
                                        id="blog-visible"
                                        type="checkbox"
                                        checked={form.isVisible}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, isVisible: e.target.checked }))
                                        }
                                    />
                                    <label htmlFor="blog-visible" style={{ marginLeft: "8px" }}>
                                        Hiển thị
                                    </label>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (<><Spinner size="sm" className="me-2" />Đang lưu...</>) : "Thêm bài viết"}
                                    </Button>
                                    <Button variant="outline-secondary" onClick={() => navigate("/admin/blogs")}>Hủy</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default InsertArticles;
