import { useContext, useState, Suspense, lazy } from "react";
import { Container, Card, Tabs, Tab, Spinner, Toast, ToastContainer } from "react-bootstrap";
import AuthContext from "../../../context/AuthContext";

// Lazy load 2 tab con để chia file gọn gàng
const InformationBootstrap = lazy(() => import("./information"));
const ChangePasswordBootstrap = lazy(() => import("./changePassword"));

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [tabKey, setTabKey] = useState("info");

    // Toast state
    const [toast, setToast] = useState({ show: false, variant: "success", content: "" });
    const handleToast = (t) => setToast((prev) => ({ ...prev, ...t }));
    const closeToast = () => setToast((t) => ({ ...t, show: false }));

    if (!user) {
        return (
            <Container className="py-5 d-flex justify-content-center">
                <Spinner animation="border" role="status" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Toast (góc phải trên) */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1056 }}>
                <Toast bg={toast.variant === "danger" ? "danger" : "success"} onClose={closeToast} show={toast.show} delay={2500} autohide>
                    <Toast.Body className="text-white">{toast.content}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Card>
                <Card.Header className="d-flex align-items-center justify-content-between">
                    <Card.Title as="h5" className="mb-0">Trang cá nhân</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Tabs activeKey={tabKey} onSelect={(k) => setTabKey(k || "info")} className="mb-3">
                        <Tab eventKey="info" title="Thông tin cá nhân">
                            <Suspense fallback={<div className="text-center py-4"><Spinner animation="border" /></div>}>
                                <InformationBootstrap user={user} onToast={handleToast} />
                            </Suspense>
                        </Tab>
                        <Tab eventKey="password" title="Đổi mật khẩu">
                            <Suspense fallback={<div className="text-center py-4"><Spinner animation="border" /></div>}>
                                <ChangePasswordBootstrap onToast={handleToast} />
                            </Suspense>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
}
