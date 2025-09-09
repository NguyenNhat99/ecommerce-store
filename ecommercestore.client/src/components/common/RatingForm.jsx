import React, { useState, useContext } from "react";
import ratingService from "../../services/ratingService";
import AuthContext from "../../context/AuthContext";

export default function RatingForm({ productId, onSuccess }) {
    const { user } = useContext(AuthContext);
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState("");
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setMsg({ type: "danger", text: "Bạn cần đăng nhập để đánh giá sản phẩm." });
            return;
        }
        if (stars === 0) {
            setMsg({ type: "danger", text: "Vui lòng chọn số sao!" });
            return;
        }
        try {
            setLoading(true);
            await ratingService.add({
                productId,
                rating: stars,
                comment,
            });
            setStars(0);
            setComment("");
            setMsg({ type: "success", text: "Đánh giá đã được gửi thành công!" });
            if (onSuccess) onSuccess();
        } catch (err) {
            setMsg({ type: "danger", text: "Gửi đánh giá thất bại, vui lòng thử lại.", err });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm border-0 rounded p-4 mt-4">
            <h5 className="mb-3">Viết đánh giá của bạn</h5>
            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <i
                            key={i}
                            className={`fa-star ${stars >= i ? "fas text-warning" : "far text-muted"}`}
                            style={{ cursor: "pointer", marginRight: 6, fontSize: 26 }}
                            onClick={() => setStars(i)}
                        />
                    ))}
                </div>
                <div className="mb-3">
                    <textarea
                        className="form-control rounded"
                        rows="3"
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-dark w-100"
                    disabled={loading}
                >
                    {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </form>
        </div>
    );
}