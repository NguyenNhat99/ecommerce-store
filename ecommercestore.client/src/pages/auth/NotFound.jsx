// src/components/NotFound.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound({
    code = 404,
    title = "Không tìm thấy trang",
    subtitle = "Trang bạn truy cập có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.",
    homePath = "/",
    showBack = true,
    showHome = true
}) {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
            style={{ background: "var(--bs-body-bg)" }}>
            <div className="container" style={{ maxWidth: 780 }}>
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 p-md-5">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2">
                                {code}
                            </span>
                            <h1 className="h4 m-0">{title}</h1>
                        </div>

                        <p className="text-secondary mb-4">{subtitle}</p>

                        {/* Illustration tối giản */}
                        <div className="text-center mb-4">
                            <svg width="240" height="140" viewBox="0 0 240 140" role="img" aria-label="Not Found">
                                <defs>
                                    <linearGradient id="nf" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0" stopColor="#60a5fa" />
                                        <stop offset="1" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <rect x="20" y="34" rx="12" ry="12" width="200" height="72" fill="#f1f5f9" />
                                <rect x="36" y="50" rx="6" ry="6" width="168" height="8" fill="#e2e8f0" />
                                <rect x="36" y="68" rx="6" ry="6" width="120" height="8" fill="#e2e8f0" />
                                <g transform="translate(160,54)">
                                    <circle cx="20" cy="20" r="20" fill="url(#nf)" opacity="0.15" />
                                    <path d="M12 28 L28 12 M28 28 L12 12" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                                </g>
                            </svg>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            {showBack && (
                                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                    ← Quay lại
                                </button>
                            )}
                            {showHome && (
                                <Link to={homePath} className="btn btn-primary">
                                    Về trang chủ
                                </Link>
                            )}
                        </div>

                        <hr className="my-4" />
                        <div className="small text-muted">
                            Mã tham chiếu: <code>#{Date.now().toString(36)}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
