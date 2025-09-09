import { useState } from "react";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import authService from "../../../services/authService";

export default function ChangePassword({ onToast }) {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            onToast({ show: true, variant: "danger", content: "Mật khẩu mới không khớp" });
            return;
        }
        try {
            setLoading(true);
            const ok = await authService.updatePassword(form.currentPassword, form.newPassword);
            onToast({
                show: true,
                variant: ok ? "success" : "danger",
                content: ok ? "Đổi mật khẩu thành công" : "Đổi mật khẩu thất bại",
            });
            if (ok) setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            onToast({ show: true, variant: "danger", content: "Có lỗi xảy ra khi đổi mật khẩu" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row className="g-3">
                <Col md={12}>
                    <Form.Group controlId="currentPassword">
                        <Form.Label>Mật khẩu hiện tại</Form.Label>
                        <Form.Control
                            type="password"
                            value={form.currentPassword}
                            onChange={setField("currentPassword")}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group controlId="newPassword">
                        <Form.Label>Mật khẩu mới</Form.Label>
                        <Form.Control
                            type="password"
                            value={form.newPassword}
                            onChange={setField("newPassword")}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={12}>
                    <Form.Group controlId="confirmPassword">
                        <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                        <Form.Control
                            type="password"
                            value={form.confirmPassword}
                            onChange={setField("confirmPassword")}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <div className="mt-3">
                <Button type="submit" variant="warning" disabled={loading}>
                    {loading ? (<><Spinner size="sm" className="me-2" />Đang xử lý...</>) : "Đổi mật khẩu"}
                </Button>
            </div>
        </Form>
    );
}
