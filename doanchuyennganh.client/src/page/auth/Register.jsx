import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Avatar,
    InputAdornment,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/authService';

const RegisterPage = () => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: 'true',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let newErrors = {};

        if (!form.firstName.trim()) newErrors.firstName = 'Vui lòng nhập họ.';
        if (!form.lastName.trim()) newErrors.lastName = 'Vui lòng nhập tên.';

        if (!form.email) newErrors.email = 'Vui lòng nhập email.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email không hợp lệ.';

        if (!form.phoneNumber) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
        else if (!/^\d{9,11}$/.test(form.phoneNumber)) newErrors.phoneNumber = 'Số điện thoại không hợp lệ.';

        if (!form.password) newErrors.password = 'Vui lòng nhập mật khẩu.';
        else if (form.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự.';

        if (form.confirmPassword !== form.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phoneNumber: form.phoneNumber,
            gender: form.gender === 'true',
        };

        setLoading(true);
        try {
            const res = await authService.signUp(data);
            setSnackbar({ open: true, message: res.message || 'Đăng ký thành công!', severity: 'success' });
            setTimeout(() => navigate('/dang-nhap'), 1500);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Đăng ký thất bại!',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                minWidth: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f5f5',
                px: 2,
            }}
        >
            <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 500, position: 'relative' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ position: 'absolute', top: 16, left: 16 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>

                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <PersonAddAlt1Icon />
                </Avatar>
                <Typography variant="h5" align="center" gutterBottom>
                    Đăng ký tài khoản
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Họ"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                        />
                        <TextField
                            label="Tên"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                        />
                    </Box>

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                            name="gender"
                            value={form.gender}
                            label="Giới tính"
                            onChange={handleChange}
                        >
                            <MenuItem value="true">Nam</MenuItem>
                            <MenuItem value="false">Nữ</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber}
                    />

                    <TextField
                        label="Mật khẩu"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
                    </Button>
                </Box>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Đã có tài khoản?{' '}
                    <a href="/dang-nhap" style={{ textDecoration: 'none' }}>Đăng nhập</a>
                </Typography>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RegisterPage;
