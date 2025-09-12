import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VendorCarousel from "../../components/common/VendorCarousel";
import productService from "../../services/productService";
import cartService from "../../services/cartService"; // <-- thêm
import { useNavigate } from "react-router-dom";
import ToastMessage from "../../components/common/ToastMessage";
import { useCart } from "../../context/CartContext";
import RatingSummary from "../../components/common/RatingSummary";
import WeatherSuggestionWidget from "../../components/common/WeatherSuggestionWidget";

const IMG_BASE = "https://localhost:7235/Assets/Products/";

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [addingId, setAddingId] = useState(null); // id sản phẩm đang thêm
    const [message, setMessage] = useState(null);   // thông báo ngắn
    const { setCartQty } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await productService.getAll();
                const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                setProducts(list);
            } catch (err) {
                console.error("Lỗi khi load sản phẩm:", err);
                setProducts([]);
                setMessage({ type: "danger", text: "Không tải được danh sách sản phẩm." });
            }
        })();
    }, []);

    const buildImg = (avatar) => {
        if (!avatar) return "/img/placeholder.png";
        return avatar.startsWith("http") ? avatar : `${IMG_BASE}${avatar}`;
    };

    // Cắt 8 sản phẩm đầu tiên
    const featuredProducts = products.slice(0, 8);

    // Lấy 8 sản phẩm mới nhất theo createAt
    const newProducts = [...products]
        .sort((a, b) => {
            const tb = Date.parse(b?.createAt ?? b?.createdAt ?? 0) || 0;
            const ta = Date.parse(a?.createAt ?? a?.createdAt ?? 0) || 0;
            return tb - ta;
        })
        .slice(0, 8);

    // ==== Handler: Thêm vào giỏ ====
    const handleAddToCart = async (productId, qty = 1) => {
        try {
            setAddingId(productId);
            setMessage(null);
            await cartService.addItem(productId, qty);
            // cập nhật badge
            const total = await cartService.getTotalQty();
            setCartQty(total);

            setMessage({
                type: "success",
                text: "Đã thêm vào giỏ hàng.",
                showGoCart: true,
            });
        } catch (err) {
            setMessage({
                type: "danger",
                text: err?.message || "Thêm vào giỏ hàng thất bại.",
            });
        } finally {
            setAddingId(null);
        }
    };

    return (
        <>
            {/* Alert nhẹ nhàng */}
            {message && (
                <div className={`alert alert-${message.type} text-center mb-0 rounded-0`} role="alert">
                    {message.text}
                </div>
            )}

            {/* Featured Start */}
            <div className="container-fluid pt-5">
                <div className="row px-xl-5 pb-3">
                    {[
                        { icon: "fa-check", text: "Sản phẩm chất lượng" },
                        { icon: "fa-shipping-fast", text: "Miễn phí giao hàng" },
                        { icon: "fa-exchange-alt", text: "Đổi trả trong 14 ngày" },
                        { icon: "fa-phone-volume", text: "Hỗ trợ 24/7" },
                    ].map((item, idx) => (
                        <div key={idx} className="col-lg-3 col-md-6 col-sm-12 pb-1">
                            <div className="d-flex align-items-center border mb-4" style={{ padding: 30 }}>
                                <h1 className={`fa ${item.icon} text-primary m-0 mr-3`}></h1>
                                <h5 className="font-weight-semi-bold m-0">{item.text}</h5>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Featured End */}

            {/* Widget gợi ý theo thời tiết */}
            <div className="container-fluid px-xl-5">
                <WeatherSuggestionWidget />
            </div>

            {/* Products Start */}
            <div className="container-fluid pt-5">
                <div className="text-center mb-4">
                    <h2 className="section-title px-5">
                        <span className="px-2">Sản phẩm nổi bật</span>
                    </h2>
                </div>
                <div className="row px-xl-5 pb-3">
                    {featuredProducts.map((p) => (
                        <div key={p?.id} className="col-lg-3 col-md-6 col-sm-12 pb-1">
                            <div className="card product-item border-0 mb-4">
                                <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                                    <img className="img-fluid w-100" src={buildImg(p?.avatar)} alt={p?.name} />
                                </div>
                                <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                                    <h6 className="text-truncate mb-3">{p?.name}</h6>
                                    <div className="d-flex justify-content-center">
                                        <h6>{Number(p?.price || 0).toLocaleString("vi-VN")} ₫</h6>
                                        {p?.originalPrice ? (
                                            <h6 className="text-muted ml-2">
                                                <del>{Number(p?.originalPrice).toLocaleString("vi-VN")} ₫</del>
                                            </h6>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="card-footer d-flex justify-content-between bg-light border">
                                    <button
                                        className="btn btn-sm text-dark p-0"
                                        onClick={() => navigate(`/chi-tiet/${p.id}`)}
                                    >
                                        <i className="fas fa-eye text-primary mr-1" />Xem
                                    </button>

                                    <RatingSummary
                                        productId={p.id}
                                        compact={true}
                                        showEmpty={false}
                                    />

                                    <button
                                        type="button"
                                        className="btn btn-sm text-dark p-0"
                                        onClick={() => handleAddToCart(p.id, 1)}
                                        disabled={addingId === p.id}
                                        aria-busy={addingId === p.id}
                                    >
                                        <i className="fas fa-shopping-cart text-primary mr-1"></i>
                                        {addingId === p.id ? "Đang thêm..." : "Thêm"}
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Products End */}

            {/* Toast hiển thị */}
            <ToastMessage message={message} onClose={() => setMessage(null)} />

            {/* Subscribe Start */}
            <div className="container-fluid bg-secondary my-5">
                <div className="row justify-content-md-center py-5 px-xl-5">
                    <div className="col-md-6 col-12 py-5">
                        <div className="text-center mb-2 pb-2">
                            <h2 className="section-title px-5 mb-3">
                                <span className="bg-secondary px-2">Đăng ký nhận tin</span>
                            </h2>
                            <p>Cập nhật những sản phẩm mới và ưu đãi đặc biệt từ chúng tôi.</p>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                                <input type="text" className="form-control border-white p-4" placeholder="Nhập email của bạn" />
                                <div className="input-group-append">
                                    <button className="btn btn-primary px-4">Đăng ký</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Subscribe End */}

            {/* Just Arrived */}
            <div className="container-fluid pt-5">
                <div className="text-center mb-4">
                    <h2 className="section-title px-5">
                        <span className="px-2">Hàng mới về</span>
                    </h2>
                </div>
                <div className="row px-xl-5 pb-3">
                    {newProducts.map((p) => (
                        <div key={p?.id} className="col-lg-3 col-md-6 col-sm-12 pb-1">
                            <div className="card product-item border-0 mb-4">
                                <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                                    <img className="img-fluid w-100" src={buildImg(p?.avatar)} alt={p?.name} />
                                </div>
                                <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                                    <h6 className="text-truncate mb-3">{p?.name}</h6>
                                    <div className="d-flex justify-content-center">
                                        <h6>{Number(p?.price || 0).toLocaleString("vi-VN")} ₫</h6>
                                        {p?.originalPrice ? (
                                            <h6 className="text-muted ml-2">
                                                <del>{Number(p?.originalPrice).toLocaleString("vi-VN")} ₫</del>
                                            </h6>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="card-footer d-flex justify-content-between bg-light border">
                                    <button
                                        className="btn btn-sm text-dark p-0"
                                        onClick={() => navigate(`/chi-tiet/${p.id}`)}
                                    >
                                        <i className="fas fa-eye text-primary mr-1" />Xem
                                    </button>

                                    <RatingSummary
                                        productId={p.id}
                                        compact={true}
                                        showEmpty={false}
                                    />

                                    <button
                                        type="button"
                                        className="btn btn-sm text-dark p-0"
                                        onClick={() => handleAddToCart(p.id, 1)}
                                        disabled={addingId === p.id}
                                        aria-busy={addingId === p.id}
                                    >
                                        <i className="fas fa-shopping-cart text-primary mr-1"></i>
                                        {addingId === p.id ? "Đang thêm..." : "Thêm"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Just Arrived End */}

            {/* Vendor Carousel */}
            <VendorCarousel
                items={[
                    "/eshopper-ui/img/vendor-1.jpg",
                    "/eshopper-ui/img/vendor-2.jpg",
                    "/eshopper-ui/img/vendor-3.jpg",
                    "/eshopper-ui/img/vendor-4.jpg",
                    "/eshopper-ui/img/vendor-5.jpg",
                    "/eshopper-ui/img/vendor-6.jpg",
                    "/eshopper-ui/img/vendor-7.jpg",
                    "/eshopper-ui/img/vendor-8.jpg",
                ]}
            />
        </>
    );
}
