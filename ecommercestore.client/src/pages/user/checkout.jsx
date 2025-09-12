import { useCallback, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "../../services/cartService";
import AuthContext from "../../context/AuthContext";
import orderService from "../../services/orderService";

const formatVND = (n) =>
    (Number(n || 0)).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

const SHIPPING_FEE = 10000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\+?84|0)\d{9,10}$/;

export default function CheckoutPage() {
    const { user } = useContext(AuthContext);
    const logged = user != null;
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(true);    // NEW: biết khi nào load xong
    const [blockEffect, setBlockEffect] = useState(false);   // NEW: chặn redirect giỏ rỗng sau khi submit

    const [info, setInfo] = useState({
        firstName: logged ? user.firstName || "" : "",
        lastName: logged ? user.lastName || "" : "",
        email: logged ? user.email || "" : "",
        phoneNumber: logged ? user.phoneNumber || "" : "",
        address: logged ? user.address || "" : "",
        note: logged ? user.note || "" : "",
    });
    const [payment, setPayment] = useState(""); // "vnp" | "cod"
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const cartData = await cartService.getCart();
            setCart(cartData);
        } catch {
            alert("Giỏ hàng bị lỗi");
        } finally {
            setCartLoading(false); // đánh dấu đã tải xong
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        if (logged) {
            setInfo((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
            }));
        }
    }, [logged, user]);

    // CHỈ redirect giỏ rỗng khi đã tải xong, KHÔNG ở trạng thái vừa đặt, và items thực sự rỗng
    useEffect(() => {
        if (cartLoading || blockEffect) return;
        if (Array.isArray(cart?.items) && cart.items.length === 0) {
            navigate("/gio-hang", { replace: true });
        }
    }, [cartLoading, blockEffect, cart, navigate]);

    const InfoChange = useCallback((e) => {
        const { name, value } = e.target;
        setInfo((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    const onPaymentChange = useCallback((e) => {
        setPayment(e.target.value);
        setErrors((prev) => ({ ...prev, payment: undefined }));
    }, []);

    const validatationCheckout = useCallback(() => {
        const newErrs = {};

        if (!info.lastName?.trim()) newErrs.lastName = "Vui lòng nhập họ.";
        if (!info.firstName?.trim()) newErrs.firstName = "Vui lòng nhập tên.";

        if (!info.email?.trim()) newErrs.email = "Vui lòng nhập email.";
        else if (!EMAIL_RE.test(info.email.trim()))
            newErrs.email = "Email không hợp lệ.";

        if (!info.phoneNumber?.trim())
            newErrs.phoneNumber = "Vui lòng nhập số điện thoại.";
        else if (!PHONE_RE.test(info.phoneNumber.trim()))
            newErrs.phoneNumber = "Số điện thoại không hợp lệ.";

        if (!info.address?.trim()) newErrs.address = "Vui lòng nhập địa chỉ.";

        if (!payment) newErrs.payment = "Vui lòng chọn phương thức thanh toán.";

        if (!Array.isArray(cart?.items) || cart.items.length === 0)
            newErrs.cart = "Giỏ hàng đang trống.";

        return newErrs;
    }, [info, payment, cart]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            const v = validatationCheckout();
            setErrors(v);
            if (Object.keys(v).length > 0) return;

            try {
                setSubmitting(true);
                setBlockEffect(true);

                const payload = {
                    customerName: `${info.lastName.trim()} ${info.firstName.trim()}`,
                    customerPhone: info.phoneNumber.trim(),
                    customerEmail: info.email.trim(),
                    shippingAddress: info.address.trim(),
                    note: info.note?.trim() || "",
                    paymentMethod: payment, // "cod" | "vnp"
                };

                if (payment === "vnp") {
                    const { order, paymentUrl } = await orderService.createVnpayOne(payload);
                    // Lưu ý: chuyển hướng qua cổng VNPay để thanh toán
                    window.location.href = paymentUrl;
                    return; // dừng luồng tại đây

                } else if (payment === "cod") {
                    const res = await orderService.createCodOne(payload);
                    navigate("/dat-hang-thanh-cong", { state: { order: res }, replace: true });

                } else {
                    alert("Vui lòng chọn phương thức thanh toán.");
                    setBlockEffect(false);
                }

            } catch (error) {
                console.error(error);
                alert(error || "Submit lỗi");
                setBlockEffect(false);
            } finally {
                setSubmitting(false);
            }
        },
        [validatationCheckout, info, payment, navigate]
    );

    const subtotal = cart?.subtotal || 0;
    const shipping = SHIPPING_FEE;
    const total = subtotal + shipping;

    // Khi đang tải giỏ -> chưa render gì (có thể đổi thành spinner nếu bạn muốn)
    if (cartLoading) return null;

    return (
        <div>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-3">
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Thanh toán
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <a href="/">Trang chủ</a>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Thanh toán</p>
                    </div>
                </div>
            </div>

            <div className="container-fluid pt-5">
                <div className="row px-xl-5">
                    <div className="col-lg-8">
                        <form className="mb-4" onSubmit={handleSubmit} noValidate>
                            <h4 className="font-weight-semi-bold mb-4">Địa chỉ thanh toán</h4>
                            <div className="row">
                                <div className="col-md-6 form-group">
                                    <label>Họ</label>
                                    <input
                                        className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                                        type="text"
                                        name="lastName"
                                        onChange={InfoChange}
                                        value={info.lastName}
                                        placeholder="Nguyễn"
                                        required
                                    />
                                    {errors.lastName && (
                                        <div className="invalid-feedback">{errors.lastName}</div>
                                    )}
                                </div>

                                <div className="col-md-6 form-group">
                                    <label>Tên</label>
                                    <input
                                        className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                                        type="text"
                                        name="firstName"
                                        onChange={InfoChange}
                                        value={info.firstName}
                                        placeholder="Văn A"
                                    />
                                    {errors.firstName && (
                                        <div className="invalid-feedback">{errors.firstName}</div>
                                    )}
                                </div>

                                <div className="col-md-6 form-group">
                                    <label>Email</label>
                                    <input
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        type="email"
                                        name="email"
                                        onChange={InfoChange}
                                        value={info.email}
                                        placeholder="example@email.com"
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>

                                <div className="col-md-6 form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                                        type="text"
                                        name="phoneNumber"
                                        onChange={InfoChange}
                                        value={info.phoneNumber}
                                        placeholder="+84 123 456 789"
                                    />
                                    {errors.phoneNumber && (
                                        <div className="invalid-feedback">{errors.phoneNumber}</div>
                                    )}
                                </div>

                                <div className="col-md-6 form-group">
                                    <label>Địa chỉ</label>
                                    <input
                                        className={`form-control ${errors.address ? "is-invalid" : ""}`}
                                        type="text"
                                        name="address"
                                        onChange={InfoChange}
                                        value={info.address}
                                        placeholder="123 Đường A"
                                    />
                                    {errors.address && (
                                        <div className="invalid-feedback">{errors.address}</div>
                                    )}
                                </div>

                                <div className="col-md-6 form-group">
                                    <label>Ghi chú</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        name="note"
                                        onChange={InfoChange}
                                        value={info.note}
                                        placeholder="Ghi chú ..."
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ display: "none" }} />
                        </form>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-secondary mb-5">
                            <div className="card-header bg-secondary border-0">
                                <h4 className="font-weight-semi-bold m-0">Tổng đơn hàng</h4>
                            </div>
                            <div className="card-body">
                                <h5 className="font-weight-medium mb-3">Sản phẩm</h5>
                                {Array.isArray(cart?.items) && cart.items.length > 0 ? (
                                    <div>
                                        {cart.items.map((item) => (
                                            <div
                                                key={item.itemId}
                                                className="d-flex justify-content-between align-items-center mb-2"
                                            >
                                                <div className="d-flex align-items-center" style={{ gap: 10 }}>
                                                    {item.avatar && (
                                                        <img
                                                            src={item.avatar}
                                                            alt={item.productName}
                                                            style={{
                                                                width: 48,
                                                                height: 48,
                                                                objectFit: "cover",
                                                                borderRadius: 6,
                                                            }}
                                                            onError={(e) => {
                                                                e.currentTarget.style.visibility = "hidden";
                                                            }}
                                                        />
                                                    )}
                                                    <div style={{ maxWidth: 200 }}>
                                                        <p className="m-0" style={{ fontSize: 14, lineHeight: 1.2 }}>
                                                            {item.productName}
                                                        </p>
                                                        {typeof item.quantity !== "undefined" && (
                                                            <small className="text-muted">x{item.quantity}</small>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="m-0" style={{ whiteSpace: "nowrap" }}>
                                                    {formatVND(item.unitPrice)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`m-0 ${errors.cart ? "text-danger" : ""}`}>
                                        {errors.cart || "Giỏ hàng trống."}
                                    </p>
                                )}

                                <hr className="mt-0" />
                                <div className="d-flex justify-content-between mb-3 pt-1">
                                    <h6 className="font-weight-medium">Tạm tính</h6>
                                    <h6 className="font-weight-medium">{formatVND(subtotal)}</h6>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <h6 className="font-weight-medium">Phí vận chuyển</h6>
                                    <h6 className="font-weight-medium">{formatVND(SHIPPING_FEE)}</h6>
                                </div>
                            </div>
                            <div className="card-footer border-secondary bg-transparent">
                                <div className="d-flex justify-content-between mt-2">
                                    <h5 className="font-weight-bold">Tổng cộng</h5>
                                    <h5 className="font-weight-bold">{formatVND(total)}</h5>
                                </div>
                            </div>
                        </div>

                        <div className="card border-secondary mb-5">
                            <div className="card-header bg-secondary border-0">
                                <h4 className="font-weight-semi-bold m-0">Phương thức thanh toán</h4>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <div className="custom-control custom-radio">
                                        <input
                                            type="radio"
                                            className="custom-control-input"
                                            name="payment"
                                            id="vnp"
                                            value="vnp"
                                            checked={payment === "vnp"}
                                            onChange={onPaymentChange}
                                        />
                                        <label className="custom-control-label" htmlFor="vnp">
                                            VNPay
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="custom-control custom-radio">
                                        <input
                                            type="radio"
                                            className="custom-control-input"
                                            name="payment"
                                            id="cod"
                                            value="cod"
                                            checked={payment === "cod"}
                                            onChange={onPaymentChange}
                                        />
                                        <label className="custom-control-label" htmlFor="cod">
                                            Thanh toán trực tiếp (COD)
                                        </label>
                                    </div>
                                </div>
                                {errors.payment && (
                                    <div className="text-danger mt-2">{errors.payment}</div>
                                )}
                            </div>
                            <div className="card-footer border-secondary bg-transparent">
                                <button
                                    className="btn btn-lg btn-block btn-primary font-weight-bold my-3 py-3"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? "Đang xử lý..." : "Đặt hàng"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
