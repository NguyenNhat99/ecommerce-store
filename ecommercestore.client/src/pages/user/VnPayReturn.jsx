import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import orderService from "../../services/orderService";

export default function VnPayReturn() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState({ loading: true, ok: false, msg: "" });

    useEffect(() => {
        (async () => {
            try {
                const search = location.search || "";
                if (!search) throw new Error("Thiếu tham số thanh toán.");

                const result = await orderService.vnpayReturn(search);

                if (result?.order) {
                    navigate("/dat-hang-thanh-cong", { state: { order: result.order }, replace: true });
                    return;
                }

                setStatus({
                    loading: false,
                    ok: String(result?.status || "").toLowerCase() === "paid" || result?.rspCode === "00",
                    msg: result?.rspCode ? `Mã phản hồi: ${result.rspCode}` : "Đã cập nhật trạng thái thanh toán.",
                });
            } catch (e) {
                setStatus({ loading: false, ok: false, msg: e?.message || "Lỗi xử lý thanh toán." });
            }
        })();
    }, [location.search, navigate]);

    if (status.loading) {
        return (
            <div className="container my-5">
                <div className="text-center">
                    <div className="spinner-border" role="status" />
                    <p className="mt-3">Đang xác thực thanh toán...</p>
                </div>
            </div>
        );
    }

    if (status.ok) {
        return (
            <div className="container my-5 text-center">
                <h3>Thanh toán thành công</h3>
                <p>{status.msg}</p>
                <Link to="/tai-khoan/don-hang" className="btn btn-primary">Xem đơn hàng của tôi</Link>
            </div>
        );
    }

    return (
        <div className="container my-5 text-center">
            <h3 className="text-danger">Thanh toán thất bại</h3>
            <p>{status.msg}</p>
            <div className="d-flex gap-2 justify-content-center">
                <Link to="/gio-hang" className="btn btn-outline-secondary">Quay lại giỏ hàng</Link>
                <Link to="/thanh-toan" className="btn btn-primary">Thử thanh toán lại</Link>
            </div>
        </div>
    );
}
