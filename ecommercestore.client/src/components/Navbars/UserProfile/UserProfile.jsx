import { Nav } from "react-bootstrap";
import styles from "@/assets/scss/UesrProfile.module.scss";
import { useContext } from "react";
import AuthContext from "../../../context/AuthContext";
import {useNavigate } from "react-router-dom"
const UserProfile = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await logout();
            navigate("/dang-nhap", { replace: true });
        } catch (err) {
            console.error(err);
        }
    }
    return (
        <div className={styles.user_menu}>
            <Nav className="p-0 flex-column">
                <Nav.Link href="/admin/thong-tin-ca-nhan" className={styles.menu}>
                    <i className="fa fa-user"></i>
                    <span>Thông tin</span>
                </Nav.Link>
                <Nav.Link href="#" className={styles.menu} onClick={handleLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Đăng xuất</span>
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default UserProfile;

