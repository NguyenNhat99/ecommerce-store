// src/pages/auth/LoginBootstrap.jsx
import { useState, useContext, useEffect, useMemo } from "react";
import {
    Container, Row, Col, Card, Form, Button, InputGroup, Spinner,
    Toast, ToastContainer, Badge, FloatingLabel
} from "react-bootstrap";
import { Eye, EyeSlash, ArrowLeft, Envelope, Lock } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginBootstrap() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const { user, login, loading: authLoading } = auth ?? {};

    const [form, setForm] = useState({ email: "", password: "", remember: true });
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (user.role === "Admin" || user.role === "Staff") navigate("/admin/dashboard", { replace: true });
        else navigate("/", { replace: true });
    }, [user, navigate]);

    const errors = useMemo(() => {
        const e = {};
        if (!form.email?.trim()) e.email = "Email không được bỏ trống";
        else if (!EMAIL_RE.test(form.email.trim())) e.email = "Email không hợp lệ";
        if (!form.password?.trim()) e.password = "Mật khẩu không được bỏ trống";
        return e;
    }, [form]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) {
            setErrMsg(Object.values(errors)[0]);
            setShowToast(true);
            return;
        }
        if (!login) {
            setErrMsg("AuthContext chưa sẵn sàng.");
            setShowToast(true);
            return;
        }
        setSubmitting(true);
        try {
            await login({ email: form.email.trim(), password: form.password, remember: form.remember });
            // điều hướng sẽ được useEffect xử lý khi user thay đổi
        } catch {
            setErrMsg("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
            setShowToast(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (!auth) {
        return <div className="p-3 text-danger">AuthContext chưa được bọc Provider.</div>;
    }

    // Nền gradient + hero
    const bgStyle = {
        minHeight: "100vh",
        background:
            "radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,.25), transparent 50%), radial-gradient(1200px 600px at 110% 110%, rgba(168,85,247,.25), transparent 50%), linear-gradient(180deg, #0f172a, #0b1220 35%, #0b1220)",
    };

    const glassCardStyle = {
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
    };

    const isBusy = submitting || authLoading;

    return (
        <div style={bgStyle} className="text-white d-flex">
            <Container fluid className="px-0">
                <Row className="g-0 min-vh-100">
                    {/* HERO - trái */}
                    <Col lg={6} className="d-none d-lg-flex align-items-center justify-content-center position-relative">
                        <div className="p-5" style={{ maxWidth: 520 }}>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <img
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.25))" }}
                                />
                                <h4 className="mb-0 fw-semibold">YourBrand</h4>
                            </div>

                            <h1 className="display-6 fw-bold mb-3">
                                Chào mừng trở lại 👋
                            </h1>
                            <p className="text-white-50 mb-4">
                                Đăng nhập để quản lý sản phẩm, đơn hàng và khách hàng trong một giao diện
                                gọn nhẹ, mượt mà và an toàn.
                            </p>

                            <div className="d-flex flex-wrap gap-2">
                                <Badge bg="primary" pill>RB v5</Badge>
                                <Badge bg="info" pill>JWT Ready</Badge>
                                <Badge bg="secondary" pill>Responsive</Badge>
                            </div>
                        </div>
                    </Col>

                    {/* FORM - phải */}
                    <Col lg={6} className="d-flex align-items-center justify-content-center">
                        <div className="w-100 px-3 px-sm-4" style={{ maxWidth: 480 }}>
                            <Card className="shadow-lg text-white" style={glassCardStyle}>
                                <Card.Header className="border-0 d-flex justify-content-between align-items-center" style={{ background: "transparent" }}>
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={() => navigate(-1)}
                                        className="rounded-pill px-3"
                                    >
                                        <ArrowLeft className="me-1" /> Quay lại
                                    </Button>
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 40, height: 40, background: "rgba(255,255,255,.08)" }}
                                        title="Bảo mật"
                                        aria-hidden
                                    >
                                        🔒
                                    </div>
                                </Card.Header>

                                <Card.Body className="pt-0">
                                    <h4 className="fw-semibold mb-2">Đăng nhập</h4>
                                    <p className="text-white-50 mb-4">Vui lòng nhập thông tin tài khoản của bạn.</p>

                                    <Form onSubmit={handleSubmit} noValidate>
                                        <FloatingLabel controlId="loginEmail" label="Email" className="mb-2">
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder=" "
                                                value={form.email}
                                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                                isInvalid={!!errors.email}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                autoComplete="username"
                                                disabled={isBusy}
                                                aria-describedby="loginEmailFeedback"
                                            />
                                            <Form.Control.Feedback type="invalid" id="loginEmailFeedback">
                                                {errors.email}
                                            </Form.Control.Feedback>
                                        </FloatingLabel>

                                        {/* Password */}
                                        <div className="mb-2">
                                            <div className="form-label text-white-50">Mật khẩu</div>

                                            <InputGroup hasValidation>
                                                <InputGroup.Text
                                                    style={{
                                                        backgroundColor: "rgba(0,0,0,0.25)",
                                                        borderColor: "rgba(0,0,0,0.15)",
                                                        color: "#fff",
                                                        borderRight: 0,
                                                        borderTopRightRadius: 0,
                                                        borderBottomRightRadius: 0,
                                                    }}
                                                >
                                                    <Lock />
                                                </InputGroup.Text>

                                                <Form.Control
                                                    type={showPw ? "text" : "password"}
                                                    name="password"
                                                    placeholder="••••••••"
                                                    value={form.password}
                                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                                    isInvalid={!!errors.password}
                                                    autoComplete="current-password"
                                                    style={{
                                                        backgroundColor: "rgba(255,255,255,0.9)",
                                                        color: "#000",
                                                        borderColor: "rgba(0,0,0,0.15)",
                                                        borderLeft: 0,
                                                        borderRight: 0,
                                                        borderRadius: 0,
                                                        height: "3rem",
                                                    }}
                                                    disabled={isBusy}
                                                    aria-describedby="loginPasswordFeedback"
                                                />

                                                <Button
                                                    type="button"
                                                    onClick={() => setShowPw((v) => !v)}
                                                    className="d-flex align-items-center"
                                                    style={{
                                                        backgroundColor: "rgba(255,255,255,0.9)",
                                                        color: "#000",
                                                        borderColor: "rgba(0,0,0,0.15)",
                                                        borderLeft: 0,
                                                        borderTopLeftRadius: 0,
                                                        borderBottomLeftRadius: 0,
                                                        height: "3rem",
                                                        paddingInline: ".75rem",
                                                        boxShadow: "none",
                                                    }}
                                                    disabled={isBusy}
                                                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                                >
                                                    {showPw ? <EyeSlash /> : <Eye />}
                                                </Button>

                                                <Form.Control.Feedback type="invalid" id="loginPasswordFeedback">
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </div>

                                        {/* Remember + Forgot */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                id="rememberMe"
                                                label={<span className="text-white-50">Ghi nhớ đăng nhập</span>}
                                                checked={form.remember}
                                                onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))}
                                                disabled={isBusy}
                                            />
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none text-white-50"
                                                onClick={() => navigate("/quen-mat-khau")}
                                                disabled={isBusy}
                                            >
                                                Quên mật khẩu?
                                            </Button>
                                        </div>

                                        <Button type="submit" className="w-100 rounded-3" disabled={isBusy}>
                                            {isBusy ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" /> Đang đăng nhập...
                                                </>
                                            ) : (
                                                "Đăng nhập"
                                            )}
                                        </Button>

                                        <div className="text-center mt-3">
                                            <small className="text-white-50">
                                                Chưa có tài khoản?{" "}
                                                <a href="/dang-ky-tai-khoan" className="link-light">Đăng ký</a>
                                            </small>
                                        </div>

                                        {/* Divider */}
                                        <div className="d-flex align-items-center gap-2 my-4">
                                            <div className="flex-grow-1" style={{ height: 1, background: "rgba(255,255,255,.15)" }} />
                                            <span className="text-white-50 small">hoặc</span>
                                            <div className="flex-grow-1" style={{ height: 1, background: "rgba(255,255,255,.15)" }} />
                                        </div>

                                        {/* Quick actions / social (placeholder) */}
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-light" className="flex-fill" disabled={isBusy}>
                                                <Envelope className="me-2" /> Đăng nhập bằng email magic link
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {/* footer nhỏ */}
                            <div className="text-center mt-3 text-white-50 small">
                                © {new Date().getFullYear()} YourBrand. All rights reserved.
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Toast lỗi */}
            <ToastContainer position="top-center" className="p-3">
                <Toast
                    bg="danger"
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={3000}
                    autohide
                >
                    <Toast.Body className="text-white">{errMsg}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}
