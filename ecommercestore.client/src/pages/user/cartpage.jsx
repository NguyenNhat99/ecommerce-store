import React, { useEffect, useMemo, useState } from "react";
import cartService from "../../services/cartService";
import { Link, useNavigate } from "react-router-dom";

const formatVND = (n) =>
    (Number(n || 0)).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

const PLACEHOLDER = "/img/placeholder.png";

// Số dòng skeleton để giữ chiều cao bảng lúc loading
const SKELETON_ROWS = 4;

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState(new Set());
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await cartService.getCart();
                setCart(data);
            } catch (e) {
                if (e?.response?.status === 401) {
                    navigate("/dang-nhap", { replace: true, state: { returnUrl: "/gio-hang" } });
                    return;
                }
                setMessage({ type: "danger", text: "Không tải được giỏ hàng." });
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const subtotal = useMemo(() => {
        if (typeof cart?.subtotal === "number") return cart.subtotal;
        if (!cart?.items?.length) return 0;
        return cart.items.reduce(
            (s, it) => s + Number(it.unitPrice || 0) * Number(it.quantity || 0),
            0
        );
    }, [cart]);

    const shippingFee = useMemo(() => (subtotal > 0 ? 10000 : 0), [subtotal]);
    const grandTotal = subtotal + shippingFee;

    const getThumb = (item) => item?.avatar || PLACEHOLDER;

    const setBusy = (id, on) => {
        setBusyIds((prev) => {
            const next = new Set(prev);
            if (on) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const updateQty = async (productId, qty) => {
        if (!cart) return;
        if (qty < 0) qty = 0;

        setBusy(productId, true);
        try {
            const updated = await cartService.updateItem(productId, qty);
            setCart(updated);
        } catch (e) {
            setMessage({ type: "danger", text: "Cập nhật số lượng thất bại." });
        } finally {
            setBusy(productId, false);
            setTimeout(() => setMessage(null), 2000);
        }
    };

    const removeItem = async (productId) => {
        setBusy(productId, true);
        try {
            const updated = await cartService.removeItem(productId);
            setCart(updated);
            setMessage({ type: "success", text: "Đã xóa sản phẩm khỏi giỏ." });
        } catch {
            setMessage({ type: "danger", text: "Xóa sản phẩm thất bại." });
        } finally {
            setBusy(productId, false);
            setTimeout(() => setMessage(null), 2000);
        }
    };

    const clearCart = async () => {
        // KHÔNG return sớm layout khác: vẫn render layout giống nhau để không shift
        try {
            setLoading(true);
            await cartService.clear();
            const data = await cartService.getCart();
            setCart(data);
            setMessage({ type: "success", text: "Đã xóa toàn bộ giỏ hàng." });
        } catch {
            setMessage({ type: "danger", text: "Xóa giỏ hàng thất bại." });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 2000);
        }
    };

    const items = cart?.items || [];

    return (
        <>
            {/* Hero: giữ chiều cao cố định để không nhảy */}
            <div className="container-fluid bg-secondary mb-3">
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: 300 }} // chiều cao cố định
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">Giỏ hàng</h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <Link to="/">Trang chủ</Link>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Giỏ hàng</p>
                    </div>
                </div>
            </div>

            {/* Alert slot: luôn giữ chỗ cao cố định để không đẩy layout khi xuất hiện */}
            <div className="container mb-3" style={{ minHeight: 48 }}>
                {message && <div className={`alert alert-${message.type} mb-0`}>{message.text}</div>}
            </div>

            <div className="container-fluid pt-5">
                <div className="row px-xl-5">
                    {/* Bảng giỏ hàng */}
                    <div className="col-lg-8 table-responsive mb-5">
                        <table
                            className="table table-bordered text-center mb-3"
                            style={{ tableLayout: "fixed" }} // giữ độ rộng cột cố định
                        >
                            <colgroup>
                                {/* Ấn định độ rộng cột để tránh co giãn khi ảnh/text về */}
                                <col style={{ width: "44%" }} />
                                <col style={{ width: "14%" }} />
                                <col style={{ width: "18%" }} />
                                <col style={{ width: "14%" }} />
                                <col style={{ width: "10%" }} />
                            </colgroup>
                            <thead className="bg-secondary text-dark">
                                <tr>
                                    <th style={{ minWidth: 220 }}>Sản phẩm</th>
                                    <th>Giá</th>
                                    <th style={{ width: 160 }}>Số lượng</th>
                                    <th>Tổng</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>

                            <tbody className="align-middle">
                                {/* Khi loading: render skeleton hàng có chiều cao cố định để không shift */}
                                {loading &&
                                    Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                                        <tr key={`sk-${idx}`} style={{ height: 68 }}>
                                            <td className="text-left">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: 4,
                                                            background: "rgba(0,0,0,.06)",
                                                            marginRight: 8,
                                                            flex: "0 0 auto",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            width: "60%",
                                                            height: 14,
                                                            background: "rgba(0,0,0,.06)",
                                                            borderRadius: 4,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        width: 60,
                                                        height: 14,
                                                        background: "rgba(0,0,0,.06)",
                                                        borderRadius: 4,
                                                        margin: "0 auto",
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        width: 120,
                                                        height: 32,
                                                        background: "rgba(0,0,0,.06)",
                                                        borderRadius: 6,
                                                        margin: "0 auto",
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        width: 72,
                                                        height: 14,
                                                        background: "rgba(0,0,0,.06)",
                                                        borderRadius: 4,
                                                        margin: "0 auto",
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        background: "rgba(0,0,0,.06)",
                                                        borderRadius: 4,
                                                        margin: "0 auto",
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                {!loading && items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-left">
                                            <div className="alert alert-secondary mb-0">
                                                Giỏ hàng trống. <Link to="/cua-hang">Tiếp tục mua sắm</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    items.map((it) => {
                                        const pid = it.productId;
                                        const total = Number(it.unitPrice || 0) * Number(it.quantity || 0);
                                        const disabled = busyIds.has(pid);

                                        return (
                                            <tr key={pid} style={{ height: 68 /* hàng cao cố định */ }}>
                                                <td className="align-middle text-left">
                                                    <div className="d-flex align-items-center">
                                                        {/* Ảnh có width/height cố định để không shift */}
                                                        <img
                                                            src={getThumb(it)}
                                                            alt={it.productName}
                                                            width={50}
                                                            height={50}
                                                            loading="eager"
                                                            decoding="async"
                                                            style={{
                                                                objectFit: "cover",
                                                                borderRadius: 4,
                                                                flex: "0 0 auto",
                                                                backgroundColor: "rgba(0,0,0,.03)",
                                                                marginRight: 8,
                                                            }}
                                                            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                                                        />
                                                        <div
                                                            className="text-truncate"
                                                            title={it.productName}
                                                            style={{ maxWidth: "80%" }}
                                                        >
                                                            {it.productName || "Sản phẩm"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="align-middle">{formatVND(it.unitPrice)}</td>
                                                <td className="align-middle">
                                                    <div className="input-group quantity mx-auto" style={{ width: 120 }}>
                                                        <div className="input-group-prepend">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => updateQty(pid, Number(it.quantity) - 1)}
                                                                disabled={disabled || Number(it.quantity) <= 0}
                                                            >
                                                                <i className="fa fa-minus"></i>
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm bg-secondary text-center"
                                                            value={it.quantity}
                                                            min={0}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value || "0", 10);
                                                                updateQty(pid, isNaN(val) ? 0 : val);
                                                            }}
                                                            disabled={disabled}
                                                            // Ấn định width/height input để không co giãn
                                                            style={{ height: 32 }}
                                                        />
                                                        <div className="input-group-append">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => updateQty(pid, Number(it.quantity) + 1)}
                                                                disabled={disabled}
                                                            >
                                                                <i className="fa fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="align-middle">{formatVND(total)}</td>
                                                <td className="align-middle">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => removeItem(pid)}
                                                        disabled={disabled}
                                                        title="Xóa"
                                                        // nút có kích thước cố định
                                                        style={{ width: 32, height: 32, lineHeight: "1" }}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>

                        {/* Footer table: giữ layout kể cả khi trống/bận */}
                        <div className="d-flex justify-content-between">
                            <Link to="/cua-hang" className="btn btn-outline-primary">
                                ← Tiếp tục mua sắm
                            </Link>
                            <button className="btn btn-outline-danger" onClick={clearCart} disabled={loading}>
                                Xóa toàn bộ giỏ
                            </button>
                        </div>
                    </div>

                    {/* Tóm tắt giỏ hàng */}
                    <div className="col-lg-4">
                        <form className="mb-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control p-4"
                                    placeholder="Mã giảm giá (demo)"
                                    // ấn định chiều cao input
                                    style={{ height: 48 }}
                                />
                                <div className="input-group-append">
                                    <button className="btn btn-primary" disabled>
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="card border-secondary mb-5">
                            <div className="card-header bg-secondary border-0" style={{ minHeight: 56 }}>
                                <h4 className="font-weight-semi-bold m-0">Tóm tắt đơn hàng</h4>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-3 pt-1">
                                    <h6 className="font-weight-medium">Tạm tính</h6>
                                    <h6 className="font-weight-medium">
                                        {loading ? "…" : formatVND(subtotal)}
                                    </h6>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <h6 className="font-weight-medium">Phí vận chuyển</h6>
                                    <h6 className="font-weight-medium">
                                        {loading ? "…" : formatVND(shippingFee)}
                                    </h6>
                                </div>
                            </div>
                            <div className="card-footer border-secondary bg-transparent">
                                <div className="d-flex justify-content-between mt-2">
                                    <h5 className="font-weight-bold">Tổng cộng</h5>
                                    <h5 className="font-weight-bold">
                                        {loading ? "…" : formatVND(grandTotal)}
                                    </h5>
                                </div>

                                <button
                                    className="btn btn-block btn-primary my-3 py-3"
                                    disabled={loading || !items.length}
                                    onClick={() => navigate("/thanh-toan")}
                                    title={!items.length ? "Giỏ hàng trống" : "Tiến hành thanh toán"}
                                >
                                    Tiến hành thanh toán
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <Link to="/cua-hang" className="btn btn-outline-primary">
                                Tiếp tục mua sắm →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
