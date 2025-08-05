import React, { useState, useContext, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Avatar,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
    Link as MuiLink,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    const { user, signIn } = useContext(AuthContext);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError('Email và mật khẩu không được bỏ trống!');
            setOpenSnackbar(true);
            return;
        }

        try {
            await signIn(form);
        } catch (err) {
            setError('Đăng nhập thất bại!');
            setOpenSnackbar(true);
        }
    };
    useEffect(() => {
        if (user) {
            if (user.role === 'Admin' || user.role === 'Staff') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

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
                <IconButton onClick={() => navigate(-1)} sx={{ position: 'absolute', top: 16, left: 16 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>

                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5" align="center" gutterBottom>
                    Đăng nhập
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Mật khẩu"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                        <MuiLink component="button" variant="body2" onClick={() => navigate('/quen-mat-khau')}>
                            Quên mật khẩu?
                        </MuiLink>
                    </Box>

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5 }}>
                        Đăng nhập
                    </Button>
                </Box>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Bạn chưa có tài khoản?{' '}
                    <a href="/dang-ky-tai-khoan" style={{ textDecoration: 'none' }}>Đăng ký</a>
                </Typography>
            </Paper>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoginPage;
