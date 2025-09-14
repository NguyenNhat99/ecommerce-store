import { useState } from "react";
import {
    Container, Row, Col, Form, Button, InputGroup, Spinner,
    Toast, ToastContainer, FloatingLabel
} from "react-bootstrap";
import { Eye, EyeSlash, Lock } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

// components auth
import AuthCard from "../../components/auth/AuthCard";
import AuthCardHeader from "../../components/auth/AuthCardHeader";
import AuthHero from "../../components/auth/AuthHero";

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

    const [showPw, setShowPw] = useState(false);
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

    // Nền gradient
    const bgStyle = {
        minHeight: "100vh",
        background:
            "radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,.25), transparent 50%), " +
            "radial-gradient(1200px 600px at 110% 110%, rgba(168,85,247,.25), transparent 50%), " +
            "linear-gradient(180deg, #0f172a, #0b1220 35%, #0b1220)",
    };

    return (
        <div style={bgStyle} className="auth-page text-white d-flex">
            <Container fluid className="px-0">
                <Row className="g-0 min-vh-100">
                    {/* HERO */}
                    <Col lg={6} className="d-none d-lg-flex align-items-center justify-content-center">
                        <AuthHero
                            title="E-Shopper 👋"
                            subtitle="Đăng ký để trải nghiệm tốt nhất."
                            badges={[
                                { text: "Uy tín", variant: "primary" },
                                { text: "Nhanh gọn", variant: "info" },
                                { text: "Thương hiệu", variant: "secondary" },
                            ]}
                        />
                    </Col>

                    {/* FORM */}
                    <Col lg={6} className="d-flex align-items-center justify-content-center">
                        <div className="w-100 px-3 px-sm-4" style={{ maxWidth: 520 }}>
                            <AuthCard>
                                <AuthCardHeader icon="👤" />

                                <Form className="pt-0 px-3" onSubmit={handleSubmit} noValidate>
                                    <h4 className="fw-semibold mb-2">Đăng ký tài khoản</h4>
                                    <p className="text-white-50 mb-4">
                                        Điền thông tin bên dưới để tạo tài khoản mới.
                                    </p>

                                    <Row className="g-2">
                                        <Col md={6}>
                                            <FloatingLabel controlId="firstName" label="Họ" className="mb-2">
                                                <Form.Control
                                                    type="text"
                                                    value={form.firstName}
                                                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                                    isInvalid={!!errors.firstName}
                                                    className="bg-white text-dark"
                                                />
                                                {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                                            </FloatingLabel>
                                        </Col>
                                        <Col md={6}>
                                            <FloatingLabel controlId="lastName" label="Tên" className="mb-2">
                                                <Form.Control
                                                    type="text"
                                                    value={form.lastName}
                                                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                                    isInvalid={!!errors.lastName}
                                                    className="bg-white text-dark"
                                                />
                                                {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                                            </FloatingLabel>
                                        </Col>
                                    </Row>

                                    {/* Giới tính */}
                                    <FloatingLabel controlId="gender" label="Giới tính" className="mb-3">
                                        <Form.Select
                                            value={form.gender}
                                            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                                            className="bg-white text-dark"
                                        >
                                            <option value="true">Nam</option>
                                            <option value="false">Nữ</option>
                                        </Form.Select>
                                    </FloatingLabel>

                                    {/* Email */}
                                    <FloatingLabel controlId="email" label="Email" className="mb-2">
                                        <Form.Control
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                            isInvalid={!!errors.email}
                                            className="bg-white text-dark"
                                            autoComplete="username"
                                        />
                                        {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                                    </FloatingLabel>

                                    {/* Phone */}
                                    <FloatingLabel controlId="phoneNumber" label="Số điện thoại" className="mb-2">
                                        <Form.Control
                                            type="tel"
                                            value={form.phoneNumber}
                                            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                                            isInvalid={!!errors.phoneNumber}
                                            className="bg-white text-dark"
                                        />
                                        {errors.phoneNumber && <div className="invalid-feedback d-block">{errors.phoneNumber}</div>}
                                    </FloatingLabel>

                                    {/* Password */}
                                    <Form.Label className="text-white-50">Mật khẩu</Form.Label>
                                    <InputGroup className="mb-2">
                                        <InputGroup.Text>
                                            <Lock />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type={showPw ? "text" : "password"}
                                            value={form.password}
                                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                            isInvalid={!!errors.password}
                                            autoComplete="new-password"
                                            className="bg-white text-dark"
                                        />
                                        <Button type="button" onClick={() => setShowPw((v) => !v)}>
                                            {showPw ? <EyeSlash /> : <Eye />}
                                        </Button>
                                    </InputGroup>
                                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}

                                    {/* Confirm Password */}
                                    <Form.Label className="text-white-50">Xác nhận mật khẩu</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text>
                                            <Lock />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type={showPw ? "text" : "password"}
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                            isInvalid={!!errors.confirmPassword}
                                            autoComplete="new-password"
                                            className="bg-white text-dark"
                                        />
                                        <Button type="button" onClick={() => setShowPw((v) => !v)}>
                                            {showPw ? <EyeSlash /> : <Eye />}
                                        </Button>
                                    </InputGroup>
                                    {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}

                                    <Button type="submit" className="w-100 rounded-3" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" /> Đang đăng ký...
                                            </>
                                        ) : (
                                            "Đăng ký"
                                        )}
                                    </Button>

                                    <div className="text-center mt-3">
                                        <small className="text-white-50">
                                            Đã có tài khoản? <a href="/dang-nhap" className="link-light">Đăng nhập</a>
                                        </small>
                                    </div>
                                </Form>
                            </AuthCard>

                            {/* Footer */}
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
