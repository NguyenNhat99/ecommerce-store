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
    SidenavUser,
} from "../../components/Sidebar/Sidebar";
import lightLogo from "../../assets/image/light-logo.png";
import lightMini from "../../assets/image/light-mini.png";
import style from "../../assets/scss/Layouts.module.scss";
import { ROUTERS } from "../../utils/router"

const Layouts = ({children }) => {
    const { sidebarMini } = useDashboardDataContext();
    return (
        <div className={style.layout_wrapper}>
            <Sidebar>
                <Logo>
                    <Link to="/">
                        <img data-logo="mini-logo" src={lightMini} alt="logo" />
                        <img data-logo="logo" src={lightLogo} alt="logo" />
                    </Link>
                </Logo>
                <SearchBar />
                <Menu>
                    <MenuItem routeLink={`/${ROUTERS.ADMIN.DASHBOARD}`}>
                        <i className="fa fa-dashboard" />
                        <span>Dashboard</span>
                    </MenuItem>
                    <SubMenu
                        label="Sản phẩm"
                        icon={<i className="fa fa-pencil-square" />}
                    >
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.INSERTPRODUCT}`}>
                            <i className="fa fa-dashboard" />
                            <span>Thêm sản phẩm</span>
                        </MenuItem>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.LISTPRODUCT}`}>
                            <i className="fa fa-dashboard" />
                            <span>Danh sách sản phẩm</span>
                        </MenuItem>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.CATEGORIES}`}>
                            <i className="fa fa-dashboard" />
                            <span>Loại sản phẩm</span>
                        </MenuItem>
                        <MenuItem routeLink={`/${ROUTERS.ADMIN.BRANDS}`}>
                            <i className="fa fa-dashboard" />
                            <span>Thương hiệu</span>
                        </MenuItem>
                    </SubMenu>
                    <MenuItem routeLink={`/${ROUTERS.ADMIN.ACCOUNTS}`}>
                        <i className="fa fa-dashboard" />
                        <span>Quản lý tài khoản</span>
                    </MenuItem>
                    <MenuItem routeLink={`/${ROUTERS.ADMIN.ORDERS}`}>
                        <i className="fa fa-dashboard" />
                        <span>Quản lý đơn hàng</span>
                    </MenuItem>
                    <MenuItem routeLink={`/`}>
                        <i className="fa fa-dashboard" />
                        <span>Doanh thu</span>
                    </MenuItem>
                 
                </Menu>
            </Sidebar>
            <div
                className={`${style.content} p-4`}
                style={{
                    width: `${
                        sidebarMini ? "calc(100% - 80px)" : "calc(100% - 280px)"
                    }`,
                }}
            >
                <Navbar />
                {children ?? <Outlet />}    
            </div>
        </div>
    );
};

export default Layouts;

