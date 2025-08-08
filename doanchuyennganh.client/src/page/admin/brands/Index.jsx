import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Snackbar,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    Typography, CircularProgress, Breadcrumbs, Link, TablePagination,
    InputAdornment, Grid
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Search } from '@mui/icons-material';
import brandService from '../../../service/brandService';

const rowsPerPageOptions = [5, 10, 25, 50, 100];

const ManageBrands = () => {
    const [brands, setBrands] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editBrand, setEditBrand] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch brands
    const fetchBrands = async () => {
        setLoading(true);
        try {
            const data = await brandService.getAll();
            setBrands(data);
            setPage(0);
        } catch (error) {
            showSnackbar(error?.toString() || 'Lỗi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    // Filter
    const filteredBrands = useMemo(() => {
        return brands.filter(b =>
            b.name.toLowerCase().includes(searchText.trim().toLowerCase())
        );
    }, [brands, searchText]);

    // Paginate
    const displayedBrands = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredBrands.slice(start, start + rowsPerPage);
    }, [filteredBrands, page, rowsPerPage]);

    // Snackbar helper
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Dialog
    const handleOpen = (brand = null) => {
        setEditBrand(brand);
        setForm({
            name: brand?.name || '',
            description: brand?.description || '',
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditBrand(null);
        setForm({ name: '', description: '' });
    };

    // Form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Thêm/Sửa
    const handleSubmit = async () => {
        if (!form.name.trim()) {
            showSnackbar('Tên thương hiệu không được bỏ trống', 'warning');
            return;
        }
        try {
            if (editBrand) {
                await brandService.updateOne(editBrand.id, form);
                setBrands(prev => prev.map(b => b.id === editBrand.id ? { ...b, ...form } : b));
                showSnackbar('Cập nhật thành công');
            } else {
                const newBrand = await brandService.createOne(form);
                setBrands(prev => [...prev, newBrand]);
                showSnackbar('Tạo mới thành công');
            }
            handleClose();
        } catch (err) {
            showSnackbar(err?.toString() || 'Lỗi', 'error');
        }
    };

    // Xóa
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa thương hiệu này?")) return;
        try {
            await brandService.deleteOne(id);
            setBrands(prev => prev.filter(b => b.id !== id));
            showSnackbar('Xóa thành công');
        } catch (err) {
            showSnackbar(err?.toString() || 'Lỗi', 'error');
        }
    };

    // Reset search
    const handleResetSearch = () => {
        setSearchText('');
        setPage(0);
    };

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="/admin/dashboard">Dashboard</Link>
                <Typography color="text.primary">Thương hiệu</Typography>
            </Breadcrumbs>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">Quản lý Thương hiệu</Typography>
                <Button variant="contained" startIcon={<Add />} sx={{ ml: "auto", borderRadius: 2 }} onClick={() => handleOpen()}>
                    Thêm thương hiệu
                </Button>
            </Box>

            <Grid container spacing={2} alignItems="center" mb={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Tìm thương hiệu ..."
                        fullWidth
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setPage(0)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end"><Search /></InputAdornment>,
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                    <Button variant="contained" onClick={() => setPage(0)} sx={{ mr: 1 }}>Tìm kiếm</Button>
                    <Button variant="outlined" onClick={handleResetSearch} sx={{ mr: 1 }}>Xóa lọc</Button>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBrands}>Làm mới</Button>
                </Grid>
            </Grid>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Tên thương hiệu</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Mô tả</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedBrands.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">Không tìm thấy thương hiệu nào.</TableCell>
                                </TableRow>
                            ) : (
                                displayedBrands.map((b, i) => (
                                    <TableRow key={b.id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                                        <TableCell>{b.name}</TableCell>
                                        <TableCell>{b.description}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Sửa">
                                                <IconButton color="info" onClick={() => handleOpen(b)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <span>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(b.id)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={filteredBrands.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={e => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        labelRowsPerPage="Số dòng/trang:"
                        rowsPerPageOptions={rowsPerPageOptions}
                    />
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tên thương hiệu"
                                name="name"
                                fullWidth
                                required
                                inputProps={{ maxLength: 255 }}
                                value={form.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả"
                                name="description"
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 500 }}
                                fullWidth
                                value={form.description}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">Lưu</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Paper elevation={0}>
                    <Typography
                        sx={{
                            color: snackbar.severity === 'success' ? 'green' : 'error.main',
                            py: 1,
                            px: 2
                        }}
                    >
                        {snackbar.message}
                    </Typography>
                </Paper>
            </Snackbar>
        </Box>
    );
};

export default ManageBrands;
