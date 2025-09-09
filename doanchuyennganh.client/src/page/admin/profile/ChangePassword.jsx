import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
} from "@mui/material";
import authService from "../../../service/authService";

const ChangePasswordPage = ({ onSnackbar }) => {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({ ...passwordForm, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            onSnackbar({ open: true, status: "error", content: "Mật khẩu mới không khớp" });
            setLoading(false);
            return;
        }
        const success = await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
        onSnackbar({
            open: true,
            status: success ? "success" : "error",
            content: success ? "Đổi mật khẩu thành công" : "Đổi mật khẩu thất bại",
        });
        setLoading(false);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <TextField
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type="password"
                fullWidth
                margin="normal"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
            />
            <TextField
                label="Mật khẩu mới"
                name="newPassword"
                type="password"
                fullWidth
                margin="normal"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
            />
            <TextField
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type="password"
                fullWidth
                margin="normal"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
            />
            <Box mt={2}>
                <Button type="submit" variant="contained" color="warning" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
            </Box>
        </Box>
    );
};

export default ChangePasswordPage;
