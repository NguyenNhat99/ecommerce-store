import { Button, Card } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

export default function AuthCardHeader({ icon }) {
    const navigate = useNavigate();
    return (
        <Card.Header
            className="border-0 d-flex justify-content-between align-items-center"
            style={{ background: "transparent" }}
        >
            <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate("/")}
                className="rounded-pill px-3"
            >
                <ArrowLeft className="me-1" /> Quay lại
            </Button>
            <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: "rgba(255,255,255,.08)" }}
            >
                {icon}
            </div>
        </Card.Header>
    );
}
