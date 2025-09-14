import { Link, Outlet } from "react-router-dom";
import Navbar from "../../components/Navbars/Navbar";
import { useDashboardDataContext } from "../../context/dashboardDataContext";
import {
    Logo,
    Menu,
    MenuItem,
    Sidebar,
    SubMenu,
    SearchBar,
} from "../../components/Sidebar/Sidebar";
import lightLogo from "../../assets/image/light-logo.png";
import lightMini from "../../assets/image/light-mini.png";
import logo from "../../assets/image/EshopperMainLogo.svg";
import lightMini11 from "../../assets/image/ShopperLogoMini.svg";
import style from "../../assets/scss/Layouts.module.scss";
import { ROUTERS } from "../../utils/router";

const Layouts = ({ children }) => {
    const { sidebarMini } = useDashboardDataContext();
    return (
        <div className={style.layout_wrapper}>
            <Sidebar>
                <Logo>
                    <Link to="/">
                        <img data-logo="mini-logo" src={lightMini11} height="40px" alt="logo" />

                        <img data-logo="logo" src={logo} alt="logo" />
                    </Link>
                </Logo>

                <SearchBar />

                <Menu>
                    <MenuItem routeLink={`/${ROUTERS.ADMIN.DASHBOARD}`}>
                        <i className="fa-solid fa-gauge" />
                        <span>Dashboard</span>
                    </MenuItem>
                    <SubMenu label="Bài viết" icon={<i className="fa-solid fa-newspaper" />}>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.BLOG}`}>
                            <i className="fa-solid fa-newspaper" />
                            <span>Danh sách</span>
                        </MenuItem>

                        <MenuItem routeLink={`/${ROUTERS.ADMIN.INSERTBLOG}`}>
                            <i className="fa-solid fa-file-circle-plus" />
                            <span>Thêm bài viết</span>
                        </MenuItem>
                    </SubMenu>
                    <SubMenu label="Sản phẩm" icon={<i className="fa-solid fa-box-open" />}>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.INSERTPRODUCT}`}>
                            <i className="fa-solid fa-square-plus" />
                            <span>Thêm sản phẩm</span>
                        </MenuItem>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.LISTPRODUCT}`}>
                            <i className="fa-solid fa-list-ul" />
                            <span>Danh sách sản phẩm</span>
                        </MenuItem>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.CATEGORIES}`}>
                            <i className="fa-solid fa-tags" />
                            <span>Loại sản phẩm</span>
                        </MenuItem>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.BRANDS}`}>
                            <i className="fa-solid fa-trademark" />
                            <span>Thương hiệu</span>
                        </MenuItem>
                    </SubMenu>

                    <MenuItem routeLink={`/${ROUTERS.ADMIN.ACCOUNTS}`}>
                        <i className="fa-solid fa-users" />
                        <span>Quản lý tài khoản</span>
                    </MenuItem>

                    <MenuItem routeLink={`/${ROUTERS.ADMIN.ORDERS}`}>
                        <i className="fa-solid fa-cart-shopping" />
                        <span>Quản lý đơn hàng</span>
                    </MenuItem>

                    <MenuItem routeLink={`/${ROUTERS.ADMIN.REVENUE}`}>
                        <i className="fa-solid fa-chart-line" />
                        <span>Doanh thu</span>
                    </MenuItem>

                  

                   
                </Menu>
            </Sidebar>

            <div
                className={`${style.content} p-4`}
                style={{
                    width: `${sidebarMini ? "calc(100% - 80px)" : "calc(100% - 280px)"}`,
                }}
            >
                <Navbar />
                {children ?? <Outlet />}
            </div>
        </div>
    );
};

export default Layouts;
