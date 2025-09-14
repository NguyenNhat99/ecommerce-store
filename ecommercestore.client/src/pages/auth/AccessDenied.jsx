// src/components/Forbidden.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Forbidden({
    code = 403,
    title = "Truy cập bị từ chối",
    subtitle = "Bạn không có quyền xem nội dung này.",
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
                            <span className="badge bg-dark-subtle text-dark-emphasis rounded-pill px-3 py-2">
                                {code}
                            </span>
                            <h1 className="h4 m-0">{title}</h1>
                        </div>

                        <p className="text-secondary mb-4">{subtitle}</p>

                        {/* Illustration tối giản */}
                        <div className="text-center mb-4">
                            <svg width="220" height="140" viewBox="0 0 220 140" role="img" aria-label="Forbidden">
                                <defs>
                                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0" stopColor="#adb5bd" />
                                        <stop offset="1" stopColor="#6c757d" />
                                    </linearGradient>
                                </defs>
                                <rect x="20" y="30" rx="12" ry="12" width="180" height="80" fill="#f1f3f5" />
                                <circle cx="110" cy="70" r="28" fill="url(#g)" opacity="0.25" />
                                <path d="M100 80 L120 60 M120 80 L100 60" stroke="#6c757d" strokeWidth="6" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            {showBack && (
                                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                    ← Quay lại
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
