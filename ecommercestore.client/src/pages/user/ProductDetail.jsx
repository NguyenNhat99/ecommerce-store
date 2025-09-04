import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import productService from "../../services/productService";
import RelatedCarousel from "../../components/common/RelatedCarousel";
import SizeGuideModal from "../../components/common/SizeGuideModal";
import ToastMessage from "../../components/common/ToastMessage";
import cartService from "../../services/cartService";
import { useCart } from "../../context/CartContext";

const IMG_BASE = "https://localhost:7235/Assets/Products/";

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [adding, setAdding] = useState(null);
    const [message, setMessage] = useState(null);
    const { setCartQty } = useCart();

    const buildImg = (avatar) => {
        if (!avatar) return "/img/placeholder.png";
        return avatar.startsWith("http") ? avatar : `${IMG_BASE}${avatar}`;
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await productService.getOne(id);
                setProduct(res);

                // Fetch toàn bộ sản phẩm rồi lọc sản phẩm liên quan
                const all = await productService.getAll();
                const relatedList = all.filter(p => p.categoryId === res.categoryId && p.id !== res.id);
                setRelated(relatedList);
            } catch (err) {
                console.error("Lỗi fetch product", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <span>Đang tải chi tiết sản phẩm...</span>
            </div>
        );
    }

    // ==== Handler: Thêm vào giỏ ====
    const handleAddToCart = async () => {
        try {
            setAdding(true);
            setMessage(null);
            await cartService.addItem(product.id, quantity);
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
            setAdding(false);
        }
    };

    const price = Number(product.price) || 0;
    const original = Number(product.originalPrice) || null;

    return (
        <>
            <div className="product-detail-page">
                {/* Page Header */}
                <div className="container-fluid bg-secondary mb-3">
                    <div
                        className="d-flex flex-column align-items-center justify-content-center"
                        style={{ minHeight: "300px" }}
                    >
                        <h1 className="font-weight-semi-bold text-uppercase mb-3">
                            Chi tiết sản phẩm
                        </h1>
                        <div className="d-inline-flex">
                            <p className="m-0">
                                <a href="/">Trang chủ</a>
                            </p>
                            <p className="m-0 px-2">-</p>
                            <p className="m-0">Chi tiết sản phẩm</p>
                        </div>
                    </div>
                </div>

                {/* Shop Detail Start */}
                <div className="container-fluid py-5">
                    <div className="row px-xl-5">
                        {/* Carousel ảnh */}
                        <div className="col-lg-5 pb-5">
                            <div
                                id="product-carousel"
                                className="carousel slide"
                                data-ride="carousel"
                            >
                                <div className="carousel-inner">
                                    {/* Ảnh đại diện */}
                                    <div className="carousel-item active" style={{ height: "550px" }}>
                                        <img
                                            className="w-100 h-100"
                                            style={{ objectFit: "contain" }}
                                            src={buildImg(product?.avatar)}
                                            alt={product.name}
                                        />
                                    </div>
                                    {/* Các ảnh khác */}
                                    {Array.isArray(product.images) &&
                                        product.images.map((img, idx) => (
                                            <div className="carousel-item" key={idx}>
                                                <img
                                                    className="w-100 h-100"
                                                    src={IMG_BASE + img}
                                                    alt={product.name}
                                                />
                                            </div>
                                        ))}
                                </div>
                                <a
                                    className="carousel-control-prev"
                                    href="#product-carousel"
                                    data-slide="prev"
                                >
                                    <i className="fa fa-2x fa-angle-left text-dark"></i>
                                </a>
                                <a
                                    className="carousel-control-next"
                                    href="#product-carousel"
                                    data-slide="next"
                                >
                                    <i className="fa fa-2x fa-angle-right text-dark"></i>
                                </a>
                            </div>
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="col-lg-7 pb-5">
                            <h3 className="font-weight-semi-bold">
                                {product.name}
                            </h3>
                            <h3 className="font-weight-semi-bold mb-4">
                                {price.toLocaleString("vi-VN")} ₫
                                {original ? (
                                    <small className="text-muted ml-2">
                                        <del>
                                            {original.toLocaleString("vi-VN")} ₫
                                        </del>
                                    </small>
                                ) : null}
                            </h3>
                            <p className="mb-4">{product.description}</p>

                            {/* Sizes */}
                            <div className="d-flex mb-3">
                                <p className="text-dark font-weight-medium mb-0 mr-3">Sizes:</p>
                                {Array.isArray(product.productSizes) &&
                                    product.productSizes.map((s) => (
                                        <div
                                            key={s.sizeId}
                                            className="custom-control custom-radio custom-control-inline"
                                        >
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id={`size-${s.sizeId}`}
                                                name="size"
                                                checked={selectedSize === s.sizeId}
                                                onChange={() =>
                                                    setSelectedSize((prev) => (prev === s.sizeId ? null : s.sizeId))
                                                }
                                            />
                                            <label
                                                className="custom-control-label"
                                                htmlFor={`size-${s.sizeId}`}
                                            >
                                                {s.sizeName}
                                            </label>
                                        </div>
                                    ))}
                            </div>

                            {/* Colors */}
                            <div className="d-flex mb-4 align-items-center">
                                <p className="text-dark font-weight-medium mb-0 mr-3">Colors:</p>
                                <div className="d-flex">
                                    {Array.isArray(product.productColors) &&
                                        product.productColors.map((c) => (
                                            <label
                                                key={c.id}
                                                className="mr-2"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="d-none"
                                                    checked={selectedColor === c.id}
                                                    onChange={() =>
                                                        setSelectedColor((prev) => (prev === c.id ? null : c.id))
                                                    }
                                                />
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        backgroundColor: c.codeColor,
                                                        border: selectedColor === c.id ? "2px solid #000" : "2px solid #ddd",
                                                    }}
                                                ></span>
                                            </label>
                                        ))}
                                </div>
                            </div>

                            {/* Quantity + Cart */}
                            <div className="d-flex align-items-center mb-4 pt-2">
                                <div
                                    className="input-group quantity mr-3"
                                    style={{ width: "130px" }}
                                >
                                    <div className="input-group-btn">
                                        <button
                                            className="btn btn-primary btn-minus"
                                            onClick={() =>
                                                setQuantity(Math.max(1, quantity - 1))
                                            }
                                        >
                                            <i className="fa fa-minus"></i>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control bg-secondary text-center"
                                        value={quantity}
                                        readOnly
                                    />
                                    <div className="input-group-btn">
                                        <button
                                            className="btn btn-primary btn-plus"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            <i className="fa fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary px-3"
                                    onClick={handleAddToCart}
                                    disabled={adding}
                                >
                                    <i className="fa fa-shopping-cart mr-1"></i>
                                    {adding ? "Đang thêm..." : "Thêm giỏ hàng"}
                                </button>
                            </div>

                            <button
                                className="btn btn-primary mb-3"
                                onClick={() => window.history.back()}
                            >
                                ← Quay lại
                            </button>
                            <button
                                className="btn btn-primary mb-3 ml-4"
                                onClick={() => setShowSizeGuide(true)}
                            >
                                Hướng dẫn chọn size
                            </button>

                            {showSizeGuide && (
                                <SizeGuideModal
                                    type={product.sizeConversion}
                                    onClose={() => setShowSizeGuide(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {/* Shop Detail End */}
            </div>

            {/* Related */}
            <div className="container-fluid py-5">
                <div className="text-center mb-4">
                    <h2 className="section-title px-5"><span className="px-2">Các sản phẩm liên quan</span></h2>
                </div>
                <RelatedCarousel products={related} />
            </div>

            <ToastMessage message={message} onClose={() => setMessage(null)} />
        </>
    );
}