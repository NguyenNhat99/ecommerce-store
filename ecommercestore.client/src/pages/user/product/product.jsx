import React, { useEffect, useMemo, useState } from "react";
import productService from "../../../services/productService";
import { useNavigate } from "react-router-dom";
import ToastMessage from "../../../components/common/ToastMessage";
import cartService from "../../../services/cartService";
import { useCart } from "../../../context/CartContext";
import RatingSummary from "../../../components/common/RatingSummary";

const IMG_BASE = "https://localhost:7235/Assets/Products/";

export default function ProductPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("");
    const [open, setOpen] = useState(false);
    const [priceRange, setPriceRange] = useState("all");
    const [selectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [addingId, setAddingId] = useState(null);
    const [message, setMessage] = useState(null);
    const { setCartQty } = useCart();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    useEffect(() => {
        (async () => {
            try {
                const res = await productService.getAll(); // phải trả về MẢNG
                // Trường hợp phòng hờ: nếu lỡ trả về object, bóc mảng ra
                const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                setProducts(list);
            } catch (err) {
                console.error("Lỗi khi load sản phẩm:", err);
                setProducts([]); // không để undefined
            }
        })();
    }, []);

    // Gom tất cả size từ DB
    const allSizes = useMemo(() => {
        const set = new Set();
        products.forEach(p => {
            (p?.productSizes || []).forEach(s => {
                if (s?.sizeName) set.add(s.sizeName);
            });
        });
        return Array.from(set); // ví dụ ["S","M","L","XL"]
    }, [products]);

    const filteredProducts = useMemo(() => {
        const items = Array.isArray(products) ? products : [];
        const q = (search || "").trim().toLowerCase();

        let arr = items.filter((p) => ((p?.name ?? "") + "").toLowerCase().includes(q));

        // lọc theo giá
        arr = arr.filter((p) => {
            const price = Number(p?.price) || 0;
            switch (priceRange) {
                case "under500":
                    return price < 500000;
                case "500to1m":
                    return price >= 500000 && price <= 1000000;
                case "1mto2m":
                    return price > 1000000 && price <= 2000000;
                case "above2m":
                    return price > 2000000;
                default:
                    return true;
            }
        });

        // lọc theo màu
        if (selectedColors.length > 0) {
            arr = arr.filter(p =>
                p?.productColors?.some(c => selectedColors.includes(c.codeColor))
            );
        }

        // lọc theo size
        if (selectedSizes.length > 0) {
            arr = arr.filter(p => {
                const sizes = (p?.productSizes || []).map(s => s.sizeName);
                return selectedSizes.some(s => sizes.includes(s));
            });
        }

        // sắp xếp
        if (sort === "latest") {
            arr = [...arr].sort((a, b) => {
                const tb = Date.parse(b?.createAt ?? b?.createdAt ?? 0) || 0;
                const ta = Date.parse(a?.createAt ?? a?.createdAt ?? 0) || 0;
                return tb - ta;
            });
        }
        return arr;
    }, [products, search, sort, priceRange, selectedColors, selectedSizes]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage]);

    // Reset về trang 1 khi bộ lọc/search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [search, sort, priceRange, selectedColors, selectedSizes]);

    // CUỘN LÊN ĐẦU TRANG khi đổi trang
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    // Helper an toàn để render ảnh
    const buildImg = (avatar) => {
        if (!avatar) return "/img/placeholder.png";
        return avatar.startsWith("http") ? avatar : `${IMG_BASE}${avatar}`;
    };

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
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-5">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "300px" }}>
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">Cửa Hàng</h1>
                    <div className="d-inline-flex">
                        <p className="m-0"><a href="/">Trang chủ</a></p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Cửa hàng</p>
                    </div>
                </div>
            </div>

            {/* Shop */}
            <div className="container-fluid pt-5">
                <div className="row px-xl-5">
                    {/* Sidebar */}
                    <div className="col-lg-3 col-md-12">
                        {/* Lọc theo giá */ }
                        <div className="border-bottom mb-4 pb-4">
                            <h5 className="font-weight-semi-bold mb-4">Lọc theo giá</h5>
                            <form>
                                <div className="custom-control custom-radio d-flex align-items-center justify-content-between mb-3">
                                    <input type="radio" className="custom-control-input" id="price-all"
                                        checked={priceRange === "all"}
                                        onChange={() => setPriceRange("all")} />
                                    <label className="custom-control-label" htmlFor="price-all">Tất cả</label>
                                    <span className="badge border font-weight-normal">{products.length}</span>
                                </div>

                                <div className="custom-control custom-radio d-flex align-items-center justify-content-between mb-3">
                                    <input type="radio" className="custom-control-input" id="price-1"
                                        checked={priceRange === "under500"}
                                        onChange={() => setPriceRange("under500")} />
                                    <label className="custom-control-label" htmlFor="price-1">Dưới 500k</label>
                                </div>

                                <div className="custom-control custom-radio d-flex align-items-center justify-content-between mb-3">
                                    <input type="radio" className="custom-control-input" id="price-2"
                                        checked={priceRange === "500to1m"}
                                        onChange={() => setPriceRange("500to1m")} />
                                    <label className="custom-control-label" htmlFor="price-2">500k - 1 triệu</label>
                                </div>

                                <div className="custom-control custom-radio d-flex align-items-center justify-content-between mb-3">
                                    <input type="radio" className="custom-control-input" id="price-3"
                                        checked={priceRange === "1mto2m"}
                                        onChange={() => setPriceRange("1mto2m")} />
                                    <label className="custom-control-label" htmlFor="price-3">1 triệu - 2 triệu</label>
                                </div>

                                <div className="custom-control custom-radio d-flex align-items-center justify-content-between">
                                    <input type="radio" className="custom-control-input" id="price-4"
                                        checked={priceRange === "above2m"}
                                        onChange={() => setPriceRange("above2m")} />
                                    <label className="custom-control-label" htmlFor="price-4">Trên 2 triệu</label>
                                </div>
                            </form>
                        </div>

                        {/* Lọc theo size */}
                        <div className="border-bottom mb-4 pb-4">
                            <h5 className="font-weight-semi-bold mb-4">Lọc theo size</h5>
                            {allSizes.map(size => (
                                <div
                                    key={size}
                                    className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3"
                                >
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id={`size-${size}`}
                                        checked={selectedSizes.includes(size)}
                                        onChange={() => {
                                            setSelectedSizes(prev =>
                                                prev.includes(size)
                                                    ? prev.filter(s => s !== size)
                                                    : [...prev, size]
                                            );
                                        }}
                                    />
                                    <label className="custom-control-label" htmlFor={`size-${size}`}>
                                        {size}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product list */}
                    <div className="col-lg-9 col-md-12">
                        <div className="row pb-3">
                            {/* Thanh search & sort */}
                            <div className="col-12 pb-1">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="input-group" style={{ maxWidth: "300px" }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tìm sản phẩm..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <div className="input-group-append">
                                            <span className="input-group-text bg-transparent text-primary">
                                                <i className="fa fa-search" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="dropdown ml-4">
                                        <button
                                            className="btn border dropdown-toggle"
                                            type="button"
                                            onClick={() => setOpen(!open)}
                                        >
                                            Sắp xếp
                                        </button>
                                        {open && (
                                            <div className="dropdown-menu dropdown-menu-right show">
                                                <button className="dropdown-item" onClick={() => setSort("latest")}>Mới nhất</button>
                                                <button className="dropdown-item" onClick={() => setSort("popularity")}>Phổ biến</button>
                                                <button className="dropdown-item" onClick={() => setSort("rating")}>Đánh giá cao</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách sản phẩm */}
                            {paginatedProducts.map((p) => {
                                const price = Number(p?.price) || 0;
                                const original = Number(p?.originalPrice) || null;
                                return (
                                    <div className="col-lg-4 col-md-6 col-sm-12 pb-1" key={p?.id}>
                                        <div className="card product-item border-0 mb-4">
                                            {/* giữ nguyên phần hiển thị */}
                                            <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                                                <img className="img-fluid w-100" src={buildImg(p?.avatar)} alt={p?.name ?? "Sản phẩm"} />
                                            </div>
                                            <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                                                <h6 className="text-truncate mb-3">{p?.name ?? "Sản phẩm"}</h6>
                                                <div className="d-flex justify-content-center">
                                                    <h6>{price.toLocaleString("vi-VN")} ₫</h6>
                                                    {original ? (
                                                        <h6 className="text-muted ml-2">
                                                            <del>{original.toLocaleString("vi-VN")} ₫</del>
                                                        </h6>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="card-footer d-flex justify-content-between bg-light border">
                                                <button className="btn btn-sm text-dark p-0" onClick={() => navigate(`/chi-tiet/${p.id}`)}>
                                                    <i className="fas fa-eye text-primary mr-1" />Chi tiết
                                                </button>
                                                <RatingSummary productId={p.id} compact={true} showEmpty={false} />
                                                <button
                                                    type="button"
                                                    className="btn btn-sm text-dark p-0"
                                                    onClick={() => handleAddToCart(p.id, 1)}
                                                    disabled={addingId === p.id}
                                                >
                                                    <i className="fas fa-shopping-cart text-primary mr-1"></i>
                                                    {addingId === p.id ? "Đang thêm..." : "Thêm"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Toast hiển thị */}
                            <ToastMessage message={message} onClose={() => setMessage(null)} />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="col-12 pb-1">
                                    <nav aria-label="Page navigation">
                                        <ul className="pagination justify-content-center mb-3">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                                                    &laquo;
                                                </button>
                                            </li>

                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                                                        {page}
                                                    </button>
                                                </li>
                                            ))}

                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                                                    &raquo;
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}