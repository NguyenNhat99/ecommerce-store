import React, { useState } from 'react';
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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import authService from '../../service/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            alert('Vui lòng nhập email.');
            return;
        }
        try {
            setLoading(true);
            await authService.forgotPassword(email);
            alert('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
            navigate('/dang-nhap');
        } catch (error) {
            alert('Gửi email thất bại');
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
                {/* Nút quay lại */}
                <MIconButton
                    onClick={() => navigate(-1)}
                    sx={{ position: 'absolute', top: 16, left: 16 }}
                >
                    <ArrowBackIosNewIcon />
                </MIconButton>

                {/* Avatar + Tiêu đề */}
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <EmailOutlinedIcon />
                </Avatar>
                <Typography variant="h5" align="center" gutterBottom>
                    Quên mật khẩu
                </Typography>
                <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                </Typography>

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                    </Button>
                </Box>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Quay lại{' '}
                    <a href="/dang-nhap" style={{ textDecoration: 'none' }}>Đăng nhập</a>
                </Typography>
            </Paper>
        </Box>
    );
};

export default ForgotPasswordPage;
