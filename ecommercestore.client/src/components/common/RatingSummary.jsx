// src/components/common/RatingSummary.jsx
import React, { useEffect, useState } from "react";
import ratingService from "../../services/ratingService";

const safeNumber = (v, fallback = 0) => {
    if (v === null || v === undefined || v === "") return fallback;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
};

export default function RatingSummary({
    avg,
    count,
    productId,
    showEmpty = true,
    compact = false,
}) {
    // initialize with numeric values if passed
    const [summary, setSummary] = useState({
        avg: safeNumber(avg, 0),
        count: safeNumber(count, 0),
    });

    useEffect(() => {
        // if parent passes avg/count later (e.g. ProductDetail), update
        setSummary({ avg: safeNumber(avg, summary.avg), count: safeNumber(count, summary.count) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avg, count]);

    useEffect(() => {
        if (!productId) return;

        let mounted = true;
        (async () => {
            try {
                const data = await ratingService.getSummary(productId);
                if (!mounted) return;
                setSummary({ avg: safeNumber(data?.avg, 0), count: safeNumber(data?.count, 0) });
            } catch (err) {
                console.error("Lỗi fetch rating summary:", err);
                if (mounted) setSummary({ avg: 0, count: 0 });
            }
        })();

        return () => { mounted = false; };
    }, [productId]);

    const avgNum = safeNumber(summary?.avg, 0);
    const countNum = safeNumber(summary?.count, 0);
    const rounded = Math.round(avgNum); // số sao hiển thị

    return (
        <div className={`d-flex align-items-center ${compact ? "" : "mb-3"}`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <i
                    key={i}
                    className={`fa-star ${i <= rounded ? "fas text-warning" : "far text-muted"}`}
                    aria-hidden="true"
                />
            ))}

            {!compact && (
                <span className="ml-2">
                    {countNum > 0 ? `${avgNum.toFixed(1)} / 5 (${countNum} đánh giá)` : (showEmpty ? "Chưa có đánh giá" : "")}
                </span>
            )}
        </div>
    );
}