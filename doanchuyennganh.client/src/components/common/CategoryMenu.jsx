import { useState } from "react";
import "./CategoryMenu.css"; // Thêm file CSS để làm mượt

export default function CategoryMenu() {
    const [isOpen, setIsOpen] = useState(true);

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
        <div className="col-lg-3 d-none d-lg-block">
            {/* Nút toggle */}
            <button
                className="btn shadow-none d-flex align-items-center justify-content-between bg-primary text-white w-100"
                style={{ height: "65px", marginTop: "-1px", padding: "0 30px" }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h6 className="m-0">Danh mục</h6>
                <i
                    className={`fa fa-angle-${isOpen ? "up" : "down"} text-dark`}
                ></i>
            </button>

            {/* Menu */}
            <div
                className={`category-collapse ${isOpen ? "show" : ""}`}
            >
                <nav className="navbar navbar-vertical navbar-light align-items-start p-0 border border-top-0 border-bottom-0">
                    <div
                        className="navbar-nav w-100 overflow-hidden"
                        style={{ height: "410px" }}
                    >
                        {categories.map((cat, idx) =>                          
                                <a href="#" className="nav-item nav-link" key={idx}>
                                    {cat.name}
                                </a>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
}