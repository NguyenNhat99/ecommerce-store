// src/pages/auth/ForgotPasswordBootstrap.jsx
import { useState } from "react";
import {
    Container, Row, Col, Card, Form, Button, InputGroup, Spinner,
    Toast, ToastContainer, Badge, FloatingLabel
} from "react-bootstrap";
import { ArrowLeft, Envelope } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService"; // chỉnh path cho đúng dự án

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordBootstrap() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: "", bg: "danger" });

    const showToast = (msg, bg = "danger") => setToast({ open: true, msg, bg });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return showToast("Vui lòng nhập email.");
        if (!EMAIL_RE.test(email.trim())) return showToast("Email không hợp lệ.");

        try {
            setLoading(true);
            await authService.forgotPassword(email.trim());
            showToast("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.", "success");
            setTimeout(() => navigate("/dang-nhap"), 1200);
        } catch (err) {
            showToast("Gửi email thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // BG gradient + glass card (đồng bộ với Login/Register)
    const bgStyle = {
        minHeight: "100vh",
        background:
            "radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,.25), transparent 50%), " +
            "radial-gradient(1200px 600px at 110% 110%, rgba(168,85,247,.25), transparent 50%), " +
            "linear-gradient(180deg, #0f172a, #0b1220 35%, #0b1220)",
    };
    const glassCardStyle = {
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
    };

    return (
        <div style={bgStyle} className="text-white d-flex">
            <Container fluid className="px-0">
                <Row className="g-0 min-vh-100">
                    {/* HERO */}
                    <Col lg={6} className="d-none d-lg-flex align-items-center justify-content-center">
                        <div className="p-5" style={{ maxWidth: 520 }}>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <img src="/logo.svg" alt="Logo" width={40} height={40}
                                    style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.25))" }} />
                                <h4 className="mb-0 fw-semibold">YourBrand</h4>
                            </div>
                            <h1 className="display-6 fw-bold mb-3">Quên mật khẩu?</h1>
                            <p className="text-white-50 mb-4">
                                Nhập email để nhận liên kết đặt lại mật khẩu. Đừng lo, thao tác này rất nhanh gọn.
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <Badge bg="primary" pill>RB v5</Badge>
                                <Badge bg="info" pill>Secure</Badge>
                                <Badge bg="secondary" pill>Responsive</Badge>
                            </div>
                        </div>
                    </Col>

                    {/* FORM */}
                    <Col lg={6} className="d-flex align-items-center justify-content-center">
                        <div className="w-100 px-3 px-sm-4" style={{ maxWidth: 480 }}>
                            <Card className="shadow-lg text-white" style={glassCardStyle}>
                                <Card.Header className="border-0 d-flex justify-content-between align-items-center" style={{ background: "transparent" }}>
                                    <Button variant="outline-light" size="sm" onClick={() => navigate(-1)} className="rounded-pill px-3">
                                        <ArrowLeft className="me-1" /> Quay lại
                                    </Button>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 40, height: 40, background: "rgba(255,255,255,.08)" }}>
                                        ✉️
                                    </div>
                                </Card.Header>

                                <Card.Body className="pt-0">
                                    <h4 className="fw-semibold mb-2">Đặt lại mật khẩu</h4>
                                    <p className="text-white-50 mb-4">Nhập email dùng để đăng ký tài khoản.</p>

                                    <Form onSubmit={handleSubmit} noValidate>
                                        <FloatingLabel controlId="forgotEmail" label="Email" className="mb-3">
                                            <Form.Control
                                                type="email"
                                                placeholder=" "
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                autoComplete="username"
                                            />
                                        </FloatingLabel>
                                        <Button type="submit" className="w-100 rounded-3" disabled={loading}>
                                            {loading ? (<><Spinner size="sm" className="me-2" /> Đang gửi...</>) : "Gửi liên kết đặt lại"}
                                        </Button>

                                        <div className="text-center mt-3">
                                            <small className="text-white-50">
                                                Nhớ lại mật khẩu? <a href="/dang-nhap" className="link-light">Đăng nhập</a>
                                            </small>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>

                            <div className="text-center mt-3 text-white-50 small">
                                © {new Date().getFullYear()} YourBrand. All rights reserved.
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Toast */}
            <ToastContainer position="top-center" className="p-3">
                <Toast bg={toast.bg} onClose={() => setToast((t) => ({ ...t, open: false }))}
                    show={toast.open} delay={2800} autohide>
                    <Toast.Body className="text-white">{toast.msg}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}
