import { Navigate, useLocation } from "react-router";
import AuthContext from "../../context/AuthContext"
import { useContext } from "react";
import Loading from "../Loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    if (loading) {
        return <Loading />;
    }
    if (!user) {
        return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
    }
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/khong-quyen-truy-cap" replace />;
    }
    return children;
};

export default ProtectedRoute;
