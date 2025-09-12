import React, { useEffect, useState } from "react";
import authService from "../../services/authService";

export default function ProfilePage() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const user = await authService.getCurrentUser();
                setInfo(user);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <div className="container py-5">Đang tải...</div>;

    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-5">
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Thông tin cá nhân
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <a href="/">Trang chủ</a>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Thông tin cá nhân</p>
                    </div>
                </div>
            </div>

            {/* Profile content */}
            <div className="container py-5">
                <div className="card shadow p-4 border-0">
                    <div className="d-flex align-items-center mb-4">
                        {info?.avatarUrl ? (
                            <img
                                src={info.avatarUrl}
                                alt="avatar"
                                className="rounded-circle"
                                style={{ width: 80, height: 80, objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                style={{ width: 80, height: 80 }}
                            >
                                    <img
                                        src="/eshopper-ui/img/default-avatar.jpg"
                                        alt="avatar"
                                        className="rounded-circle"
                                        style={{ width: 80, height: 80, objectFit: "cover" }}
                                    />
                            </div>
                        )}
                        <div className="ml-4">
                            <h4 className="mb-1">{`${info?.firstName || ""} ${info?.lastName || ""}`}</h4>
                            <p className="text-muted mb-0">{info?.email}</p>
                        </div>
                    </div>

                    <table className="table table-borderless mb-4">
                        <tbody>
                            <tr>
                                <th width="200">Tên đăng nhập</th>
                                <td>{info?.userName}</td>
                            </tr>
                            <tr>
                                <th>Số điện thoại</th>
                                <td>{info?.phoneNumber || "Chưa cập nhật"}</td>
                            </tr>
                            <tr>
                                <th>Địa chỉ</th>
                                <td>{info?.address || "Chưa cập nhật"}</td>
                            </tr>
                            <tr>
                                <th>Giới tính</th>
                                <td>
                                    {info?.gender === true ? "Nam" : info?.gender === false ? "Nữ" : "Chưa cập nhật"}
                                </td>
                            </tr>
                            <tr>
                                <th>Mật khẩu</th>
                                <td>
                                    <input
                                        type="password"
                                        value="********"
                                        disabled
                                        style={{ border: "none", background: "transparent" }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <a href="/doi-mat-khau" className="btn btn-primary">
                        <i className="fa fa-lock mr-2"></i> Đổi mật khẩu
                    </a>
                </div>
            </div>
        </>
    );
}