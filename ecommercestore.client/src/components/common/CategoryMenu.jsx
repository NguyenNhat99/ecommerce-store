import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import categoryService from "../../services/categoryService";
import "./CategoryMenu.css";

export default function CategoryMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (location.pathname === "/") {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [location.pathname]);

    // gọi API lấy categories
    useEffect(() => {
        (async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error("Lỗi load categories", err);
            }
        })();
    }, []);

    const handleClick = (cat) => {
        const categoryId = cat.id;
        navigate(`/danh-muc/${categoryId}`);
    };

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
                        {categories.map((cat) => (
                            <button
                                type="button"
                                key={cat.id}
                                className="nav-item nav-link text-left btn btn-link"
                                style={{ textDecoration: "none" }}
                                onClick={() => handleClick(cat)}
                            >
                                {cat.categoryName}
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}