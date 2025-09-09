import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

export default function RelatedCarousel({ products }) {
    const IMG_BASE = "https://localhost:7097/Assets/Products/";

    const buildImg = (avatar) => {
        if (!avatar) return "/img/placeholder.png";
        return avatar.startsWith("http") ? avatar : `${IMG_BASE}${avatar}`;
    };

    return (
        <div className="row px-xl-5">
            <div className="col">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={30}
                    slidesPerView={4}
                    autoplay={{ delay: 2000, disableOnInteraction: false }}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        576: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        992: { slidesPerView: 4 },
                    }}
                >
                    {Array.isArray(products) &&
                        products.map((p) => (
                            <SwiperSlide key={p.id}>
                                <div className="card product-item border-0">
                                    <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                                        <img
                                            className="img-fluid w-100"
                                            src={buildImg(p?.avatar)}
                                            alt={p.name ?? "Sản phẩm"}
                                        />
                                    </div>
                                    <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                                        <h6 className="text-truncate mb-3">{p.name}</h6>
                                        <div className="d-flex justify-content-center">
                                            <h6>{p.price.toLocaleString("vi-VN")} ₫</h6>
                                            {p.originalPrice && (
                                                <h6 className="text-muted ml-2">
                                                    <del>{p.originalPrice.toLocaleString("vi-VN")} ₫</del>
                                                </h6>
                                            )}
                                        </div>
                                    </div>
                                    <div className="card-footer d-flex justify-content-between bg-light border">
                                        <a href={`/product/${p.id}`} className="btn btn-sm text-dark p-0">
                                            <i className="fas fa-eye text-primary mr-1"></i>Xem
                                        </a>
                                        <button className="btn btn-sm text-dark p-0">
                                            <i className="fas fa-shopping-cart text-primary mr-1"></i>Thêm
                                        </button>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                </Swiper>
            </div>
        </div>
    );
}