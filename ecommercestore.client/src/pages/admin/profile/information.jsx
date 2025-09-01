import { useEffect, useState } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import authService from "../../../services/authService";

export default function Information({ user, onToast }) {
    const [info, setInfo] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        gender: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        setInfo({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phoneNumber: user.phoneNumber || "",
            address: user.address || "",
            gender: user.gender ?? true,
        });
    }, [user]);

    const setField = (name) => (e) => {
        const val = e.target.value;
        setInfo((prev) => ({
            ...prev,
            [name]: name === "gender" ? (val === "true") : val,
        }));
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const ok = await authService.updateInformation(info);
            onToast({
                show: true,
                variant: ok ? "success" : "danger",
                content: ok ? "Cập nhật thông tin thành công" : "Cập nhật thất bại",
            });
        } catch (err) {
            onToast({ show: true, variant: "danger", content: "Có lỗi xảy ra khi cập nhật" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form>
            <Row className="g-3">
                <Col md={6}>
                    <Form.Group controlId="username">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <Form.Control value={user?.userName || ""} disabled />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="role">
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Control value={user?.role || ""} disabled />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="lastName">
                        <Form.Label>Họ</Form.Label>
                        <Form.Control value={info.lastName} onChange={setField("lastName")} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="firstName">
                        <Form.Label>Tên</Form.Label>
                        <Form.Control value={info.firstName} onChange={setField("firstName")} />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group controlId="phoneNumber">
                        <Form.Label>Số điện thoại</Form.Label>
                        <Form.Control value={info.phoneNumber} onChange={setField("phoneNumber")} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="gender">
                        <Form.Label>Giới tính</Form.Label>
                        <Form.Select value={String(info.gender)} onChange={setField("gender")}>
                            <option value="true">Nam</option>
                            <option value="false">Nữ</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col md={12}>
                    <Form.Group controlId="address">
                        <Form.Label>Địa chỉ</Form.Label>
                        <Form.Control value={info.address} onChange={setField("address")} />
                    </Form.Group>
                </Col>
            </Row>

            <div className="mt-3 d-flex justify-content-end">
                <Button onClick={handleUpdate} disabled={loading}>
                    {loading ? (<><Spinner size="sm" className="me-2" />Đang cập nhật...</>) : "Cập nhật"}
                </Button>
            </div>
        </Form>
    );
}
