import { useState } from "react";
import {
  Container, Row, Col, Form, Button, Spinner, Toast, ToastContainer, FloatingLabel
} from "react-bootstrap";
import { Envelope } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

// components auth
import AuthCard from "../../components/auth/AuthCard";
import AuthCardHeader from "../../components/auth/AuthCardHeader";
import AuthHero from "../../components/auth/AuthHero";

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
              title="Quên mật khẩu?"
              subtitle="Nhập email để nhận liên kết đặt lại mật khẩu. Đừng lo, thao tác này rất nhanh gọn."
                          badges={[
                              { text: "Uy tín", variant: "primary" },
                              { text: "Nhanh gọn", variant: "info" },
                              { text: "Thương hiệu", variant: "secondary" },
                          ]}
            />
          </Col>

          {/* FORM */}
          <Col lg={6} className="d-flex align-items-center justify-content-center">
            <div className="w-100 px-3 px-sm-4" style={{ maxWidth: 480 }}>
              <AuthCard>
                <AuthCardHeader icon={<Envelope />} />

                <Form className="pt-0 px-3" onSubmit={handleSubmit} noValidate>
                  <h4 className="fw-semibold mb-2">Đặt lại mật khẩu</h4>
                  <p className="text-white-50 mb-4">Nhập email dùng để đăng ký tài khoản.</p>

                  <FloatingLabel controlId="forgotEmail" label="Email" className="mb-3">
                    <Form.Control
                      type="email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white text-dark"
                      autoComplete="username"
                      disabled={loading}
                    />
                  </FloatingLabel>

                  <Button type="submit" className="w-100 rounded-3" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" /> Đang gửi...
                      </>
                    ) : (
                      "Gửi liên kết đặt lại"
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <small className="text-white-50">
                      Nhớ lại mật khẩu?{" "}
                      <a href="/dang-nhap" className="link-light">Đăng nhập</a>
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
