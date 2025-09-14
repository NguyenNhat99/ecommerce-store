import { useEffect, useRef, useState } from "react";
import { useDashboardDataContext } from "@/context/dashboardDataContext";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import UserProfile from "./UserProfile/UserProfile";
import styles from "@/assets/scss/Navbar.module.scss";
import profile from "../../assets/image/admin.jpg";

const Navbar = () => {
    const [openUser, setOpenUser] = useState(false);
    const { sidebarMini, setSidebarMini } = useDashboardDataContext();

    let dropRef = useRef();
    useEffect(() => {
        document.addEventListener("mousedown", (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpenUser(false);
            }
        });
    }, []);

    return (
        <div className={styles.navbars_wrapper}>
            <div className="d-flex align-items-center justify-content-between">
                <button
                    type="button"
                    className={`${styles.minimize_btn} ${
                        sidebarMini ? styles.minimize_active : ""
                    }`}
                    onClick={() => setSidebarMini(!sidebarMini)}
                >
                    <span></span>
                    <span className={styles.toggle_effect}></span>
                    <span></span>
                </button>

                <ul ref={dropRef}>
                    <li>
                        <div className={styles.user_profile}>
                            <a
                                href="#"
                                onClick={() => {
                                    setOpenUser(!openUser);
                                    setOpenMessage(false);
                                    setOpenNotification(false);
                                }}
                            >
                                <img src={profile} alt="uesr" />
                            </a>
                        </div>
                        {openUser ? (
                            <DropdownMenu left="24px" right="24px">
                                <UserProfile />
                            </DropdownMenu>
                        ) : null}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;

