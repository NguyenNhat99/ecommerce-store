import { useContext, useEffect, useState } from "react";
import weatherService from "../../services/weatherService";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

export default function WeatherSuggestionWidget() {
    const { user } = useContext(AuthContext);
    const [suggestion, setSuggestion] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Nếu chưa có user/address → không fetch
        if (!user?.address) return;

        const cityName = removeVietnameseTones(user.address).replace(/\s+/g, " ");

        (async () => {
            try {
                setLoading(true);
                const weatherRes = await weatherService.getSuggestion(cityName);
                if (!weatherRes) return;

                setSuggestion(weatherRes);

                const [productsRes, categoriesRes] = await Promise.all([
                    productService.getAll(),
                    categoryService.getAll(),
                ]);

                const categoryMap = {};
                categoriesRes.forEach((c) => (categoryMap[c.id] = c.categoryName));

                // Lọc sản phẩm theo gợi ý category
                const filtered = productsRes.filter((p) =>
                    weatherRes.suggestedCategories.includes(categoryMap[p.categoryId])
                );

                // Nhóm sản phẩm theo category → lấy 2 sản phẩm mỗi category
                const grouped = weatherRes.suggestedCategories.map((cat) => {
                    const items = filtered.filter((p) => categoryMap[p.categoryId] === cat);
                    return { category: cat, products: items.slice(0, 4) };
                });

                setProducts(grouped);
            } catch (err) {
                console.error("Weather widget error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    if (!user?.address || loading || !suggestion || products.length === 0) return null;

    return (
        <div className="my-8">
            <div className="text-center mb-4">
                <h2 className="section-title px-5">
                    <span className="px-2">Gợi ý cho bạn</span>
                </h2>
            </div>

            <Swiper
                spaceBetween={0}
                slidesPerView={2}
                modules={[Autoplay]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                loop={true}
            >
                {products.map((group, idx) => (
                    group.products.map((p) => (
                        <SwiperSlide key={p.id || `${group.category}-${idx}`}>
                            <img
                                src={p.avatar}
                                alt={p.name}
                                className="w-full h-40 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                                onClick={() => navigate(`/chi-tiet/${p.id}`)}
                            />
                        </SwiperSlide>
                    ))
                ))}
            </Swiper>
        </div>
    );
}