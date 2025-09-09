import React, { useState } from "react";
import authService from "../../services/authService";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState(null);
    const [show, setShow] = useState({ current: false, new: false, confirm: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirm) {
            setMsg({ type: "danger", text: "Mật khẩu xác nhận không khớp!" });
            return;
        }
        try {
            const ok = await authService.updatePassword(currentPassword, newPassword);
            if (ok) {
                setMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirm("");
            } else {
                setMsg({ type: "danger", text: "Đổi mật khẩu thất bại!" });
            }
        } catch {
            setMsg({ type: "danger", text: "Có lỗi xảy ra." });
        }
    };

    const renderPasswordInput = (label, value, setValue, field) => (
        <div className="form-group mb-3">
            <label>{label}</label>
            <div className="input-group">
                <input
                    type={show[field] ? "text" : "password"}
                    className="form-control"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <div className="input-group-append">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShow((prev) => ({ ...prev, [field]: !prev[field] }))}
                    >
                        <i className={`fa ${show[field] ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            {/* Page Header */}
            <div className="container-fluid bg-secondary mb-5">
                <div
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "300px" }}
                >
                    <h1 className="font-weight-semi-bold text-uppercase mb-3">
                        Đổi mật khẩu
                    </h1>
                    <div className="d-inline-flex">
                        <p className="m-0">
                            <a href="/">Thông tin</a>
                        </p>
                        <p className="m-0 px-2">-</p>
                        <p className="m-0">Đổi mật khẩu</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="container py-5" style={{ maxWidth: 600 }}>
                <div className="card shadow p-4 border-0">

                    {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

                    <form onSubmit={handleSubmit}>
                        {renderPasswordInput("Mật khẩu hiện tại", currentPassword, setCurrentPassword, "current")}
                        {renderPasswordInput("Mật khẩu mới", newPassword, setNewPassword, "new")}
                        {renderPasswordInput("Xác nhận mật khẩu mới", confirm, setConfirm, "confirm")}

                        <div className="d-flex justify-content-between mt-4">
                            <a href="/thong-tin" className="btn btn-light">
                                <i className="fa fa-arrow-left mr-2"></i> Trở về
                            </a>
                            <button type="submit" className="btn btn-primary">
                                <i className="fa fa-save mr-2"></i> Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}