import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./CategoryMenu.css";

export default function CategoryMenu() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (location.pathname === "/") {
            setIsOpen(true);   // Home mở mặc định
        } else {
            setIsOpen(false);  // Shop đóng mặc định
        }
    }, [location.pathname]);

    const categories = [
        { name: "Đầm váy" },
        { name: "Áo sơ mi" },
        { name: "Quần jeans" },
        { name: "Đồ bơi" },
        { name: "Đồ ngủ" },
        { name: "Đồ thể thao" },
        { name: "Jumpsuit" },
        { name: "Áo blazer" },
        { name: "Áo khoác" },
        { name: "Giày dép" }
    ];

    return (
        <div className="col-lg-3 d-none d-lg-block position-relative">
            {/* Nút toggle */}
            <button
                className="btn shadow-none d-flex align-items-center justify-content-between bg-primary text-white w-100"
                style={{ height: "65px", marginTop: "-1px", padding: "0 30px" }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h6 className="m-0">Danh mục</h6>
                <i className={`fa fa-angle-${isOpen ? "up" : "down"} text-dark`}></i>
            </button>

            {/* Menu overlay */}
            <div className={`category-overlay ${isOpen ? "show" : ""} ${location.pathname === "/" ? "home" : "shop"}`}>
                <nav className="navbar navbar-vertical navbar-light align-items-start p-0 border border-top-0 border-bottom-0 bg-white">
                    <div className="navbar-nav w-100 overflow-auto" style={{ maxHeight: "410px" }}>
                        {categories.map((cat, idx) => (
                            <a href="#" className="nav-item nav-link" key={idx}>
                                {cat.name}
                            </a>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}