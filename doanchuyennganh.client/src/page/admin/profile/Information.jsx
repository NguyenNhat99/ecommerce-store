import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Grid,
} from "@mui/material";
import authService from "../../../service/authService";

const InformationPage = ({ user, onSnackbar }) => {
    const [infoData, setInfoData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        gender: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setInfoData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
                gender: user.gender ?? true,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfoData((prev) => ({
            ...prev,
            [name]: name === "gender" ? value === "true" : value,
        }));
    };

    const handleUpdate = async () => {
        setLoading(true);
        const result = await authService.updateInformation(infoData);
        if (result) {
            onSnackbar({ open: true, status: "success", content: "Cập nhật thông tin thành công" });
        } else {
            onSnackbar({ open: true, status: "error", content: "Cập nhật thất bại" });
        }
        setLoading(false);
    };

    return (
        <Box component="form" noValidate autoComplete="off" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" mb={2}>Thông tin cá nhân</Typography>

            <TextField
                label="Tên đăng nhập"
                value={user.userName}
                fullWidth
                disabled
                margin="normal"
            />
            <TextField
                label="Vai trò"
                value={user.role}
                fullWidth
                disabled
                margin="normal"
            />
            <TextField
                label="Số điện thoại"
                name="phoneNumber"
                value={infoData.phoneNumber}
                fullWidth
                margin="normal"
                onChange={handleChange}
            />
            <TextField
                label="Họ"
                name="lastName"
                value={infoData.lastName}
                fullWidth
                margin="normal"
                onChange={handleChange}
            />
            <TextField
                label="Tên"
                name="firstName"
                value={infoData.firstName}
                fullWidth
                margin="normal"
                onChange={handleChange}
            />
            <TextField
                label="Địa chỉ"
                name="address"
                value={infoData.address}
                fullWidth
                margin="normal"
                onChange={handleChange}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="gender-label">Giới tính</InputLabel>
                <Select
                    labelId="gender-label"
                    name="gender"
                    value={infoData.gender.toString()}
                    onChange={handleChange}
                    label="Giới tính"
                >
                    <MenuItem value="true">Nam</MenuItem>
                    <MenuItem value="false">Nữ</MenuItem>
                </Select>
            </FormControl>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" onClick={handleUpdate} disabled={loading}>
                    {loading ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
            </Box>
        </Box>
    );
};

export default InformationPage;
