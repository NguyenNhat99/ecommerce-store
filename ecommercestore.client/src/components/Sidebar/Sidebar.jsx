import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import style from "../../assets/scss/Sidebar.module.scss";
import { useDashboardDataContext } from "../../context/dashboardDataContext";

export function Sidebar({ children }) {
    const [selectSize, setSelectSize] = useState(null);
    const { sidebarMini, setSidebarMini } = useDashboardDataContext();

    let dropRef = useRef();
    useEffect(() => {
        window.onresize = function () {
            setSelectSize(window.screen.width);
        };
        if (selectSize === 1024 || selectSize > 2) {
            document.addEventListener("mousedown", (e) => {
                if (dropRef.current && !dropRef.current.contains(e.target)) {
                    setSidebarMini(false);
                }
            });
        }
    }, [selectSize, setSidebarMini]);

    return (
        <div
            ref={dropRef}
            className={`${style.sidebar} ${sidebarMini ? style.collapse : ""}`}
        >
            {children}
        </div>
    );
}

export function Menu({ children }) {
    return <ul className={style.nav}>{children}</ul>;
}

export function SubMenu({ icon, label, children }) {
    const [subMenu, setSubMenu] = useState(label);
    return (
        <li className={style.nav_item}>
            <a
                className="d-flex align-items-center justify-content-between"
                onClick={() => setSubMenu(!label === subMenu ? true : false)}
            >
                <div className="d-flex align-items-center">
                    {icon}
                    <span>{label}</span>
                </div>
                <i
                    className={`${style.arrow} ${
                        subMenu
                            ? "fa-solid fa-caret-up"
                            : "fa-solid fa-caret-down"
                    }`}
                />
            </a>
            <ul
                data-submenu-expanded={subMenu ? false : true}
                className={style.submenu}
            >
                {children}
            </ul>
        </li>
    );
}

export function MenuItem({ routeLink, hrefUrl, children }) {
    return (
        <li className={style.nav_item}>
            {routeLink ? (
                <NavLink to={routeLink}>{children}</NavLink>
            ) : (
                <a href={hrefUrl} target="_blank">
                    {children}
                </a>
            )}
        </li>
    );
}

export function Logo({ children }) {
    return (
        <div className={`${style.logo_wrapper} d-flex align-items-center`}>
            {children}
        </div>
    );
}

export function SearchBar() {
    return (
        <div className={style.search_bar}>
            <div className="position-relative">
                <input type="text" placeholder="search" />
                <span className={style.search_icon}>
                    <i className="fa-solid fa-magnifying-glass" />
                </span>
            </div>
        </div>
    );
}

export function SidenavUser({ userImg, userName, userEmail }) {
    return (
        <div className={`${style.sidenav_user} d-flex gap-3`}>
            <div className={style.user_img}>
                <img src={userImg} alt="user img" />
            </div>
            <div
                className={`${style.user_info} d-flex align-items-center justify-content-between w-100`}
            >
                <div>
                    <h3 className={style.user_name}>{userName}</h3>
                    <span className={style.user_email}>{userEmail}</span>
                </div>
                <span className={style.logout_icon}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M16 16.9999L21 11.9999M21 11.9999L16 6.99994M21 11.9999H9M12 16.9999C12 17.2955 12 17.4433 11.989 17.5713C11.8748 18.9019 10.8949 19.9968 9.58503 20.2572C9.45903 20.2823 9.31202 20.2986 9.01835 20.3312L7.99694 20.4447C6.46248 20.6152 5.69521 20.7005 5.08566 20.5054C4.27293 20.2453 3.60942 19.6515 3.26118 18.8724C3 18.2881 3 17.5162 3 15.9722V8.02764C3 6.4837 3 5.71174 3.26118 5.12746C3.60942 4.34842 4.27293 3.75454 5.08566 3.49447C5.69521 3.29941 6.46246 3.38466 7.99694 3.55516L9.01835 3.66865C9.31212 3.70129 9.45901 3.71761 9.58503 3.74267C10.8949 4.0031 11.8748 5.09798 11.989 6.42855C12 6.55657 12 6.70436 12 6.99994"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </div>
        </div>
    );
}

