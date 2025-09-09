// src/components/common/HeroCarousel.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function HeroCarousel() {
    const swiperRef = useRef(null);
    const containerRef = useRef(null);
    const [loadedCount, setLoadedCount] = useState(0);

    const slides = [
        {
            img: '/eshopper-ui/img/carousel-1.jpg',
            subtitle: 'Giảm 10% cho đơn hàng đầu',
            title: 'Thời trang mới',
            link: '/cua-hang',
        },
        {
            img: '/eshopper-ui/img/carousel-2.jpg',
            subtitle: 'Giảm 10% cho đơn hàng đầu',
            title: 'Giá hợp lý',
            link: '/cua-hang',
        },
    ];

    // tăng bộ đếm khi 1 ảnh load xong
    function handleImgLoad() {
        setLoadedCount((c) => c + 1);
    }

    // Khi tất cả ảnh load => update Swiper (một lần)
    useEffect(() => {
        if (loadedCount === slides.length && swiperRef.current?.update) {
            // small delay để layout ổn định rồi update
            const t = setTimeout(() => swiperRef.current.update(), 60);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadedCount]);

    // ResizeObserver / fallback resize -> update swiper
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            if (swiperRef.current?.update) swiperRef.current.update();
        });
        ro.observe(el);

        const onWinResize = () => {
            if (swiperRef.current?.update) swiperRef.current.update();
        };
        window.addEventListener('resize', onWinResize);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', onWinResize);
        };
    }, []);

    return (
        // wrapper chiếm full width của cột (không bleed ra ngoài)
        <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
            <Swiper
                className="hero-swiper"           // dùng class để áp CSS riêng cho hero
                modules={[Autoplay, Navigation, Pagination]}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                observer={true}
                observeParents={true}
                onSwiper={(s) => { swiperRef.current = s; }}
                slidesPerView={1}
                spaceBetween={0}
            >
                {slides.map((slide, idx) => (
                    <SwiperSlide key={idx}>
                        <div className="hero-slide" style={{ width: '100%', height: '410px' }}>
                            <img
                                src={slide.img}
                                alt={slide.title}
                                className="hero-slide-img"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onLoad={handleImgLoad}
                            />
                            <div className="hero-caption">
                                <div className="hero-caption-inner">
                                    <h4 className="text-light text-uppercase font-weight-medium mb-3">
                                        {slide.subtitle}
                                    </h4>
                                    <h3 className="display-4 text-white font-weight-semi-bold mb-4">
                                        {slide.title}
                                    </h3>
                                    <Link to={slide.link} className="btn btn-light py-2 px-3">
                                        Mua ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}