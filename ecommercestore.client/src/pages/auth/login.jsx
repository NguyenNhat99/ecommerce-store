import { useState, useContext, useEffect, useMemo, useRef } from "react";
import {
    Container, Row, Col, Form, Button, InputGroup, Spinner,
    Toast, ToastContainer, FloatingLabel, Alert
} from "react-bootstrap";
import { Eye, EyeSlash, Lock } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

// components auth
import AuthCard from "../../components/auth/AuthCard";
import AuthCardHeader from "../../components/auth/AuthCardHeader";
import AuthHero from "../../components/auth/AuthHero";

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
    const [caps, setCaps] = useState(false);

    const pwdRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        if (user.role === "Admin" || user.role === "Staff") {
            navigate("/admin/dashboard", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const errors = useMemo(() => {
        const e = {};
        if (!form.email?.trim()) e.email = "Email không được bỏ trống";
        else if (!EMAIL_RE.test(form.email.trim())) e.email = "Email không hợp lệ";
        if (!form.password?.trim()) e.password = "Mật khẩu không được bỏ trống";
        return e;
    }, [form]);

    const isBusy = submitting || authLoading;

    const showError = (msg) => {
        setErrMsg(msg || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
        setShowToast(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) {
            showError(Object.values(errors)[0]);
            return;
        }
        if (!login) {
            showError("AuthContext chưa sẵn sàng.");
            return;
        }
        setSubmitting(true);
        try {
            await login({
                email: form.email.trim(),
                password: form.password,
                remember: form.remember,
            });
            // useEffect sẽ điều hướng khi user thay đổi
        } catch (err) {
            // Ưu tiên thông điệp từ service/context nếu có
            const msg = err?.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.";
            showError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // phát hiện CapsLock cho ô mật khẩu
    const onPwdKey = (e) => {
        // event.getModifierState hoạt động cho keyboard events
        const isCaps = e.getModifierState && e.getModifierState("CapsLock");
        setCaps(!!isCaps);
    };

    if (!auth) {
        return <div className="p-3 text-danger">AuthContext chưa được bọc Provider.</div>;
    }

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
                    {/* HERO - trái */}
                    <Col lg={6} className="d-none d-lg-flex align-items-center justify-content-center">
                        <AuthHero
                            title="E-Shopper 👋"
                            subtitle="Đăng nhập để trải nghiệm tốt nhất."
                            badges={[
                                { text: "Uy tín", variant: "primary" },
                                { text: "Nhanh gọn", variant: "info" },
                                { text: "Thương hiệu", variant: "secondary" },
                            ]}
                        />
                    </Col>

                    {/* FORM - phải */}
                    <Col lg={6} className="d-flex align-items-center justify-content-center">
                        <div className="w-100 px-3 px-sm-4" style={{ maxWidth: 480 }}>
                            <AuthCard>
                                <AuthCardHeader icon="🔒" />

                                <Form className="pt-0 px-3" onSubmit={handleSubmit} noValidate>
                                    <h4 className="fw-semibold mb-2">Đăng nhập</h4>
                                    <p className="text-white-50 mb-4">
                                        Vui lòng nhập thông tin tài khoản của bạn.
                                    </p>

                                    {/* Email */}
                                    <FloatingLabel controlId="loginEmail" label="Email" className="mb-2">
                                        <Form.Control
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                            isInvalid={!!errors.email}
                                            className="bg-white text-dark"
                                            style={{ borderColor: "rgba(0,0,0,.1)" }}
                                            autoComplete="username"
                                            disabled={isBusy}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
                                    </FloatingLabel>

                                    {/* Password */}
                                    <div className="mb-2">
                                        <div className="form-label text-white-50 d-flex justify-content-between align-items-center">
                                            <span>Mật khẩu</span>
                                            {caps && <small className="text-warning">CapsLock đang bật</small>}
                                        </div>
                                        <InputGroup hasValidation>
                                            <InputGroup.Text
                                                style={{
                                                    backgroundColor: "rgba(0,0,0,0.25)",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                    color: "#fff",
                                                }}
                                            >
                                                <Lock />
                                            </InputGroup.Text>

                                            <Form.Control
                                                ref={pwdRef}
                                                type={showPw ? "text" : "password"}
                                                value={form.password}
                                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                                onKeyUp={onPwdKey}
                                                onKeyDown={onPwdKey}
                                                onFocus={onPwdKey}
                                                isInvalid={!!errors.password}
                                                autoComplete="current-password"
                                                style={{
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    color: "#000",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                }}
                                                disabled={isBusy}
                                            />

                                            <Button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="d-flex align-items-center"
                                                style={{
                                                    backgroundColor: "rgba(255,255,255,0.9)",
                                                    color: "#000",
                                                    borderColor: "rgba(0,0,0,0.15)",
                                                }}
                                                disabled={isBusy}
                                                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                            >
                                                {showPw ? <EyeSlash /> : <Eye />}
                                            </Button>

                                            <Form.Control.Feedback type="invalid">
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
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
                                </Form>
                            </AuthCard>

                            <div className="text-center mt-3 text-white-50 small">
                                © {new Date().getFullYear()} YourBrand. All rights reserved.
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

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
