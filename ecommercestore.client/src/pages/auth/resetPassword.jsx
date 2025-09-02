// src/pages/auth/ResetPasswordBootstrap.jsx
import { useState, useEffect } from "react";
import {
    Container, Row, Col, Card, Form, Button, Spinner, Toast, ToastContainer,
    FloatingLabel, Badge
} from "react-bootstrap";
import { ArrowLeft, Lock } from "react-bootstrap-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";

export default function ResetPasswordBootstrap() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: "", bg: "danger" });

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!email || !token) {
            setToast({ open: true, msg: "Liên kết không hợp lệ.", bg: "danger" });
            navigate("/dang-nhap", { replace: true });
        }
    }, [email, token, navigate]);

    const showToast = (msg, bg = "danger") => setToast({ open: true, msg, bg });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim() || !confirmPassword.trim()) {
            return showToast("Vui lòng nhập đầy đủ mật khẩu.");
        }
        if (password !== confirmPassword) {
            return showToast("Mật khẩu không khớp.");
        }

        try {
            setLoading(true);
            await authService.resetPassword({ email, token, newPassword: password });
            showToast("Đặt lại mật khẩu thành công!", "success");
            setTimeout(() => navigate("/dang-nhap", { replace: true }), 1200);
        } catch {
            showToast("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // BG gradient + glass card (đồng bộ với Login/Forgot)
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
        <div style={bgStyle} className="auth-page text-white d-flex">
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
                            <h1 className="display-6 fw-bold mb-3">Đặt lại mật khẩu 🔑</h1>
                            <p className="text-white-50 mb-4">
                                Nhập mật khẩu mới cho tài khoản của bạn. Hãy chọn mật khẩu đủ mạnh để bảo mật tốt hơn.
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
                                        <Lock />
                                    </div>
                                </Card.Header>

                                <Card.Body className="pt-0">
                                    <h4 className="fw-semibold mb-2">Tạo mật khẩu mới</h4>
                                    <p className="text-white-50 mb-4">Vui lòng nhập và xác nhận mật khẩu mới.</p>

                                    <Form onSubmit={handleSubmit} noValidate>
                                        <FloatingLabel controlId="newPassword" label="Mật khẩu mới" className="mb-3">
                                            <Form.Control
                                                type="password"
                                                placeholder=" "
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                autoComplete="new-password"
                                                disabled={loading}
                                            />
                                        </FloatingLabel>
                                        <FloatingLabel controlId="confirmPassword" label="Xác nhận mật khẩu" className="mb-3">
                                            <Form.Control
                                                type="password"
                                                placeholder=" "
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                autoComplete="new-password"
                                                disabled={loading}
                                            />
                                        </FloatingLabel>
                                        <Button type="submit" className="w-100 rounded-3" disabled={loading}>
                                            {loading ? (<><Spinner size="sm" className="me-2" /> Đang xử lý...</>) : "Đặt lại mật khẩu"}
                                        </Button>
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
