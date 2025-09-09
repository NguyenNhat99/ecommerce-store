import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export default function VendorCarousel({ items = [] }) {
    return (
        <div
            style={{
                width: '100vw',
                overflow: 'hidden',
                background: '#fff',
            }}
        >
            <Swiper
                modules={[Autoplay]}
                spaceBetween={30}
                slidesPerView={6}
                autoplay={{ delay: 2000, disableOnInteraction: false }}
                loop={true}
                observer={false}
                observeParents={false}
                breakpoints={{
                    0: { slidesPerView: 2 },
                    576: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    992: { slidesPerView: 5 },
                    1200: { slidesPerView: 6 },
                }}
            >
                {items.map((src, i) => (
                    <SwiperSlide key={i}>
                        <img
                            className="img-fluid"
                            src={src}
                            alt={`vendor-${i}`}
                            style={{
                                maxHeight: '80px',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto',
                            }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}