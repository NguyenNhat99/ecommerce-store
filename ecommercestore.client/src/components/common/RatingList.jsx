import React from "react";

export default function RatingList({ ratings }) {
    if (!ratings || ratings.length === 0) {
        return <p className="text-muted mt-3">Chưa có đánh giá nào cho sản phẩm này.</p>;
    }

    return (
        <div className="mt-4">
            <h5 className="mb-3">Đánh giá từ khách hàng</h5>
            {ratings.map((r) => (
                <div key={r.id} className="d-flex mb-4 border-bottom pb-3">
                    <div
                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40, fontWeight: 600 }}
                    >
                        {(r.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="ml-3 flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                            <strong>{r.email}</strong>
                            <small className="text-muted">
                                {new Date(r.createAt).toLocaleDateString("vi-VN")}
                            </small>
                        </div>
                        <div className="mb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <i
                                    key={i}
                                    className={`fa-star ${r.rating >= i ? "fas text-warning" : "far text-muted"}`}
                                />
                            ))}
                        </div>
                        <p className="mb-0">{r.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}