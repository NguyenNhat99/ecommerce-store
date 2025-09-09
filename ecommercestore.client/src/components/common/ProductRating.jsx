import React, { useEffect, useState } from "react";
import ratingService from "../../services/ratingService";
import RatingForm from "./RatingForm";
import RatingList from "./RatingList";

export default function ProductRating({ productId, onSummaryChange }) {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRatings = async () => {
        try {
            setLoading(true);
            const data = await ratingService.getByProduct(productId);
            setRatings(data || []);
            if (onSummaryChange) {
                const avg =
                    data && data.length > 0
                        ? data.reduce((sum, r) => sum + Number(r.rating ?? 0), 0) / data.length
                        : 0;
                onSummaryChange({
                    avg: avg,          // number, không toFixed()
                    count: data.length,
                });
            }
        } catch (err) {
            console.error("Lỗi khi load rating:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchRatings();
    }, [productId]);

    return (
        <div className="container-fluid py-5 mt-5">
            <div className="text-center mb-4">
                <h2 className="section-title px-5"><span className="px-2">Đánh giá sản phẩm</span></h2>
            </div>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <>
                    <RatingList ratings={ratings} />
                    <RatingForm productId={productId} onSuccess={fetchRatings} />
                </>
            )}
        </div>
    );
}