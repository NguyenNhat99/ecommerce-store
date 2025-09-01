import { useEffect, useRef, useState } from "react";
import { useDashboardDataContext } from "@/context/dashboardDataContext";
import DarkModeSwitch from "../DarkModeSwitch/DarkModeSwitch";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import Notification from "./Notification/Notification";
import Message from "./Message/Message";
import UserProfile from "./UserProfile/UserProfile";
import styles from "@/assets/scss/Navbar.module.scss";
import profile from "../../assets/image/admin.jpg";

const Navbar = () => {
    const [openNotification, setOpenNotification] = useState(false);
    const [openMessage, setOpenMessage] = useState(false);
    const [openUser, setOpenUser] = useState(false);
    const { sidebarMini, setSidebarMini } = useDashboardDataContext();

    let dropRef = useRef();
    useEffect(() => {
        document.addEventListener("mousedown", (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpenNotification(false);
                setOpenMessage(false);
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
                        <DarkModeSwitch />
                    </li>
                    <li>
                        <button
                            type="button"
                            onClick={() => {
                                setOpenNotification(!openNotification);
                                setOpenMessage(false);
                                setOpenUser(false);
                            }}
                        >
                            <i className="fa fa-bell"></i>
                            <span className={`${styles.count} bg-danger`}>
                                5
                            </span>
                        </button>
                        {openNotification ? (
                            <DropdownMenu left="24px" right="24px">
                                <Notification />
                            </DropdownMenu>
                        ) : null}
                    </li>
                    <li>
                        <button
                            type="button"
                            onClick={() => {
                                setOpenMessage(!openMessage);
                                setOpenNotification(false);
                                setOpenUser(false);
                            }}
                        >
                            <i className="fa-solid fa-envelope"></i>
                            <span className={`${styles.count} bg-primary`}>
                                5
                            </span>
                        </button>
                        {openMessage ? (
                            <DropdownMenu left="24px" right="24px">
                                <Message />
                            </DropdownMenu>
                        ) : null}
                    </li>
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

