import { Badge } from "react-bootstrap";

export default function AuthHero({ title, subtitle, badges }) {
    return (
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
            <h1 className="display-6 fw-bold mb-3">{title}</h1>
            <p className="text-white-50 mb-4">{subtitle}</p>
            <div className="d-flex flex-wrap gap-2">
                {badges.map((b, i) => (
                    <Badge key={i} bg={b.variant} pill>
                        {b.text}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
