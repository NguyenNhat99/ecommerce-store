import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Modal,
  Badge,
  Table,
  Pagination,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../../../services/authService";

const MOCK_ORDERS = [
  { id: "HD001", status: "Delivered", total: 200000, date: "2024-07-10", address: "Hà Nội", items: [{ name: "Áo thun", qty: 2 }] },
  { id: "HD002", status: "Shipping", total: 450000, date: "2024-07-15", address: "Đà Nẵng", items: [{ name: "Quần jeans", qty: 1 }] },
  { id: "HD003", status: "Cancelled", total: 150000, date: "2024-07-18", address: "TP.HCM", items: [{ name: "Áo sơ mi", qty: 1 }] },
];

const ROLE_DISPLAY = {
  Admin: { label: "Admin", variant: "danger" },
  Staff: { label: "Nhân viên", variant: "info" },
  Customer: { label: "Khách hàng", variant: "success" },
  User: { label: "User", variant: "secondary" },
};

export default function DetailAccountBootstrap() {
  const { email } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "true",
  });
  const [role, setRole] = useState("");
  const [lockStatus, setLockStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // modal
  const [showDelete, setShowDelete] = useState(false);
  const [showOrder, setShowOrder] = useState({ show: false, order: null });

  // orders
  const [page, setPage] = useState(1);
  const perPage = 5;
  const orders = MOCK_ORDERS;
  const totalPages = Math.ceil(orders.length / perPage);
  const pagedOrders = orders.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    authService
      .getAccountDetail(email)
      .then((data) => {
        setAccount(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          gender: data.gender ? "true" : "false",
        });
        setRole(data.role);
      })
      .catch((err) => {
        setError(err?.message || "Không thể tải dữ liệu tài khoản");
        setAccount(null);
      })
      .finally(() => setLoading(false));
  }, [email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateInformation(form);
      alert("Cập nhật thành công");
    } catch (err) {
      alert("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = () => {
    setLockStatus((s) => !s);
    alert(lockStatus ? "Đã mở khóa" : "Đã khóa tài khoản");
  };

  const confirmDelete = () => {
    setShowDelete(false);
    alert("Đã xoá tài khoản");
    navigate("/admin/quan-ly-tai-khoan");
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !account) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Không tìm thấy tài khoản"}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>
              <strong>Chi tiết tài khoản</strong>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ</Form.Label>
                    <Form.Control
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên</Form.Label>
                    <Form.Control
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" value={form.email} disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Giới tính</Form.Label>
                    <Form.Select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vai trò</Form.Label>
                    <Form.Select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Staff">Nhân viên</option>
                      <option value="Customer">Khách hàng</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </Button>
                <Button
                  variant={lockStatus ? "success" : "warning"}
                  onClick={handleToggleLock}
                >
                  {lockStatus ? "Mở khóa" : "Khóa"}
                </Button>
                <Button variant="danger" onClick={() => setShowDelete(true)}>
                  Xoá
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <strong>Đơn hàng</strong>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.date}</td>
                      <td>
                        <Badge
                          bg={
                            o.status === "Delivered"
                              ? "success"
                              : o.status === "Shipping"
                              ? "info"
                              : "danger"
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td>{o.total.toLocaleString()} đ</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-info"
                          onClick={() => setShowOrder({ show: true, order: o })}
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {pagedOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <div className="d-flex justify-content-end">
                <Pagination>
                  <Pagination.Prev
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  />
                </Pagination>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal xoá */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xoá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xoá tài khoản{" "}
          <b>
            {form.firstName} {form.lastName}
          </b>{" "}
          ({form.email}) không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xoá
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        show={showOrder.show}
        onHide={() => setShowOrder({ show: false, order: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng {showOrder.order?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showOrder.order && (
            <>
              <p>
                <b>Ngày:</b> {showOrder.order.date}
              </p>
              <p>
                <b>Địa chỉ:</b> {showOrder.order.address}
              </p>
              <p>
                <b>Tổng tiền:</b>{" "}
                {showOrder.order.total.toLocaleString()} đ
              </p>
              <p>
                <b>Sản phẩm:</b>
              </p>
              <ul>
                {showOrder.order.items.map((it, idx) => (
                  <li key={idx}>
                    {it.name} x{it.qty}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOrder({ show: false, order: null })}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
