import { useState } from "react";
import {
    Container, Row, Col, Card, Form, Button, InputGroup, Spinner,
    Toast, ToastContainer, Badge, FloatingLabel
} from "react-bootstrap";
import { ArrowLeft, Eye, EyeSlash, Lock } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService"; // chỉnh path cho đúng

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{9,11}$/;

export default function RegisterBootstrap() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        gender: "true", // "true" | "false"
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });

    const [showPw, setShowPw] = useState(false); // dùng chung cho 2 ô password
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, msg: "", bg: "danger" });

    const errors = (() => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = "Vui lòng nhập họ.";
        if (!form.lastName.trim()) e.lastName = "Vui lòng nhập tên.";
        if (!form.email.trim()) e.email = "Vui lòng nhập email.";
        else if (!EMAIL_RE.test(form.email.trim())) e.email = "Email không hợp lệ.";
        if (!form.phoneNumber.trim()) e.phoneNumber = "Vui lòng nhập số điện thoại.";
        else if (!PHONE_RE.test(form.phoneNumber.trim())) e.phoneNumber = "Số điện thoại không hợp lệ.";
        if (!form.password) e.password = "Vui lòng nhập mật khẩu.";
        else if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự.";
        if (form.confirmPassword !== form.password) e.confirmPassword = "Mật khẩu xác nhận không khớp.";
        return e;
    })();

    const showErrToast = (msg) => setToast({ open: true, msg, bg: "danger" });
    const showOkToast = (msg) => setToast({ open: true, msg, bg: "success" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length) {
            showErrToast(Object.values(errors)[0]);
            return;
        }
        setLoading(true);
        try {
            const payload = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
                phoneNumber: form.phoneNumber.trim(),
                gender: form.gender === "true",
            };
            const res = await authService.signUp(payload);
            showOkToast(res?.message || "Đăng ký thành công!");
            setTimeout(() => navigate("/dang-nhap"), 1200);
        } catch (err) {
            showErrToast(err?.message || "Đăng ký thất bại!");
        } finally {
            setLoading(false);
        }
    };

    // BG gradient + glass card
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
                                <img
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.25))" }}
                                />
                                <h4 className="mb-0 fw-semibold">YourBrand</h4>
                            </div>
                            <h1 className="display-6 fw-bold mb-3">Tạo tài khoản mới ✨</h1>
                            <p className="text-white-50 mb-4">
                                Chỉ vài bước nhanh gọn để bắt đầu trải nghiệm hệ thống quản trị hiện đại của bạn.
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <Badge bg="primary" pill>RB v5</Badge>
                                <Badge bg="info" pill>Form Validation</Badge>
                                <Badge bg="secondary" pill>Responsive</Badge>
                            </div>
                        </div>
                    </Col>

                    {/* FORM */}
                    <Col lg={6} className="d-flex align-items-center justify-content-center">
                        <div className="w-100 px-3 px-sm-4" style={{ maxWidth: 520 }}>
                            <Card className="shadow-lg text-white" style={glassCardStyle}>
                                <Card.Header className="border-0 d-flex justify-content-between align-items-center" style={{ background: "transparent" }}>
                                    <Button variant="outline-light" size="sm" onClick={() => navigate(-1)} className="rounded-pill px-3">
                                        <ArrowLeft className="me-1" /> Quay lại
                                    </Button>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 40, height: 40, background: "rgba(255,255,255,.08)" }}>
                                        👤
                                    </div>
                                </Card.Header>

                                <Card.Body className="pt-0">
                                    <h4 className="fw-semibold mb-2">Đăng ký tài khoản</h4>
                                    <p className="text-white-50 mb-4">Điền thông tin bên dưới để tạo tài khoản mới.</p>

                                    <Form onSubmit={handleSubmit} noValidate>
                                        {/* Họ & Tên */}
                                        <Row className="g-2">
                                            <Col md={6}>
                                                <FloatingLabel controlId="firstName" label="Họ" className="mb-2">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=" "
                                                        value={form.firstName}
                                                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                                        isInvalid={!!errors.firstName}
                                                        className="bg-white text-dark"
                                                        style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                    />
                                                </FloatingLabel>
                                                {errors.firstName && <div className="invalid-feedback d-block mb-2">{errors.firstName}</div>}
                                            </Col>
                                            <Col md={6}>
                                                <FloatingLabel controlId="lastName" label="Tên" className="mb-2">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=" "
                                                        value={form.lastName}
                                                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                                        isInvalid={!!errors.lastName}
                                                        className="bg-white text-dark"
                                                        style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                    />
                                                </FloatingLabel>
                                                {errors.lastName && <div className="invalid-feedback d-block mb-2">{errors.lastName}</div>}
                                            </Col>
                                        </Row>

                                        {/* Giới tính (Floating + đồng bộ chiều cao) */}
                                        <FloatingLabel controlId="gender" label="Giới tính" className="mb-3">
                                            <Form.Select
                                                value={form.gender}
                                                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                            >
                                                <option value="true">Nam</option>
                                                <option value="false">Nữ</option>
                                            </Form.Select>
                                        </FloatingLabel>

                                        {/* Email */}
                                        <FloatingLabel controlId="email" label="Email" className="mb-2">
                                            <Form.Control
                                                type="email"
                                                placeholder=" "
                                                value={form.email}
                                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                                isInvalid={!!errors.email}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                                autoComplete="username"
                                            />
                                        </FloatingLabel>
                                        {errors.email && <div className="invalid-feedback d-block mb-2">{errors.email}</div>}

                                        {/* Số điện thoại */}
                                        <FloatingLabel controlId="phoneNumber" label="Số điện thoại" className="mb-2">
                                            <Form.Control
                                                type="tel"
                                                placeholder=" "
                                                value={form.phoneNumber}
                                                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                                                isInvalid={!!errors.phoneNumber}
                                                className="bg-white text-dark"
                                                style={{ borderColor: "rgba(0,0,0,.1)" }}
                                            />
                                        </FloatingLabel>
                                        {errors.phoneNumber && <div className="invalid-feedback d-block mb-2">{errors.phoneNumber}</div>}

                                        {/* Mật khẩu */}
                                        <Form.Label className="text-white-50">Mật khẩu</Form.Label>
                                        <InputGroup className="mb-2" hasValidation>
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
                                                placeholder="••••••••"
                                                value={form.password}
                                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                                isInvalid={!!errors.password}
                                                autoComplete="new-password"
                                                style={{
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    color: "#000",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                    borderLeft: 0,
                                                    borderRight: 0,
                                                    borderRadius: 0,
                                                }}
                                            />

                                            <Button
                                                type="button"
                                                className="d-flex align-items-center"
                                                onClick={() => setShowPw((v) => !v)}
                                                style={{
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    color: "#000",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                    borderLeft: 0,
                                                    borderTopLeftRadius: 0,
                                                    borderBottomLeftRadius: 0,
                                                    paddingInline: ".75rem",
                                                    boxShadow: "none",
                                                }}
                                            >
                                                {showPw ? <EyeSlash /> : <Eye />}
                                            </Button>
                                        </InputGroup>
                                        {errors.password && <div className="invalid-feedback d-block mb-2">{errors.password}</div>}

                                        {/* Xác nhận mật khẩu */}
                                        <Form.Label className="text-white-50">Xác nhận mật khẩu</Form.Label>
                                        <InputGroup className="mb-3" hasValidation>
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
                                                placeholder="••••••••"
                                                value={form.confirmPassword}
                                                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                                isInvalid={!!errors.confirmPassword}
                                                autoComplete="new-password"
                                                style={{
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    color: "#000",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                    borderLeft: 0,
                                                    borderRight: 0,
                                                    borderRadius: 0,
                                                }}
                                            />

                                            <Button
                                                type="button"
                                                className="d-flex align-items-center"
                                                onClick={() => setShowPw((v) => !v)}
                                                style={{
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    color: "#000",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                    borderLeft: 0,
                                                    borderTopLeftRadius: 0,
                                                    borderBottomLeftRadius: 0,
                                                    paddingInline: ".75rem",
                                                    boxShadow: "none",
                                                }}
                                            >
                                                {showPw ? <EyeSlash /> : <Eye />}
                                            </Button>
                                        </InputGroup>
                                        {errors.confirmPassword && <div className="invalid-feedback d-block mb-2">{errors.confirmPassword}</div>}

                                        {/* Submit */}
                                        <Button type="submit" className="w-100 rounded-3" disabled={loading}>
                                            {loading ? (<><Spinner size="sm" className="me-2" /> Đang đăng ký...</>) : "Đăng ký"}
                                        </Button>

                                        <div className="text-center mt-3">
                                            <small className="text-white-50">
                                                Đã có tài khoản? <a href="/dang-nhap" className="link-light">Đăng nhập</a>
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
                <Toast
                    bg={toast.bg}
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                    show={toast.open}
                    delay={2800}
                    autohide
                >
                    <Toast.Body className="text-white">{toast.msg}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}
