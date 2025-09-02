import { Card } from "react-bootstrap";

const glassCardStyle = {
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.06)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export default function AuthCard({ children }) {
  return (
    <Card className="shadow-lg text-white" style={glassCardStyle}>
      {children}
    </Card>
  );
}
