import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Avatar,
    IconButton,
    IconButton as MIconButton,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = ({ onSubmitEmail }) => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            alert('Vui lòng nhập email.');
            return;
        }
        if (onSubmitEmail) onSubmitEmail(email);
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
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2, py: 1.5 }}
                    >
                        Gửi liên kết đặt lại
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
