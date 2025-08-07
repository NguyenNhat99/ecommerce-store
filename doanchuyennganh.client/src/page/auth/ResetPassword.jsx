import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Avatar,
    IconButton as MIconButton,
    CircularProgress
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../service/authService';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!email || !token) {
            alert('Liên kết không hợp lệ.');
            navigate('/dang-nhap');
        }
    }, [email, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            alert('Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Mật khẩu không khớp.');
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword({ email, token, newPassword: password });
            alert('Đặt lại mật khẩu thành công!');
            navigate('/dang-nhap');
        } catch (error) {
            alert('Đặt lại mật khẩu thất bại');
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
            <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 400, position: 'relative' }}>
                <MIconButton
                    onClick={() => navigate(-1)}
                    sx={{ position: 'absolute', top: 16, left: 16 }}
                >
                    <ArrowBackIosNewIcon />
                </MIconButton>

                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <LockResetIcon />
                </Avatar>
                <Typography variant="h5" align="center" gutterBottom>
                    Đặt lại mật khẩu
                </Typography>
                <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                    Nhập mật khẩu mới cho tài khoản của bạn.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Mật khẩu mới"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <TextField
                        label="Xác nhận mật khẩu"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2, py: 1.5 }}
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ResetPasswordPage;
