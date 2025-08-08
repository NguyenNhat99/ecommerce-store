import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Grid, Tooltip, InputAdornment, Breadcrumbs, Link,
    Snackbar, Alert, CircularProgress, IconButton, TablePagination
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Search } from '@mui/icons-material';
import categoryService from '../../../service/categoryService';

const rowsPerPageOptions = [5, 10, 25, 50, 100];

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [form, setForm] = useState({ categoryName: '', description: '' });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            setCategories(data);
            setPage(0);
        } catch (error) {
            showSnackbar(error?.toString() || 'Lỗi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(c =>
            c.categoryName.toLowerCase().includes(searchText.trim().toLowerCase())
        );
    }, [categories, searchText]);

    const displayedCategories = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredCategories.slice(start, start + rowsPerPage);
    }, [filteredCategories, page, rowsPerPage]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleOpen = (category = null) => {
        setEditCategory(category);
        setForm({
            categoryName: category?.categoryName || '',
            description: category?.description || '',
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditCategory(null);
        setForm({ categoryName: '', description: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.categoryName.trim()) {
            showSnackbar('Tên loại sản phẩm không được bỏ trống', 'warning');
            return;
        }
        try {
            if (editCategory) {
                await categoryService.updateOne(editCategory.id, form);
                setCategories(prev => prev.map(c => c.id === editCategory.id ? { ...c, ...form } : c));
                showSnackbar('Cập nhật thành công');
            } else {
                const newCategory = await categoryService.createOne(form);
                setCategories(prev => [...prev, newCategory]);
                showSnackbar('Tạo mới thành công');
            }
            handleClose();
        } catch (err) {
            showSnackbar(err?.toString() || 'Lỗi', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa loại sản phẩm này?")) return;
        try {
            await categoryService.deleteOne(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            showSnackbar('Xóa thành công');
        } catch (err) {
            showSnackbar(err?.toString() || 'Lỗi', 'error');
        }
    };

    const handleResetSearch = () => {
        setSearchText('');
        setPage(0);
    };

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="/admin/dashboard">Dashboard</Link>
                <Typography color="text.primary">Loại sản phẩm</Typography>
            </Breadcrumbs>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">Quản lý Loại sản phẩm</Typography>
                <Button variant="contained" startIcon={<Add />} sx={{ ml: "auto", borderRadius: 2 }} onClick={() => handleOpen()}>
                    Thêm loại
                </Button>
            </Box>

            <Grid container spacing={2} alignItems="center" mb={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Tìm loại sản phẩm ..."
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
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchCategories}>Làm mới</Button>
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
                                <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tên loại</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Mô tả</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">Không tìm thấy loại sản phẩm nào.</TableCell>
                                </TableRow>
                            ) : (
                                displayedCategories.map((c, i) => (
                                    <TableRow key={c.id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                                        <TableCell>{c.categoryName}</TableCell>
                                        <TableCell>{c.description}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Sửa">
                                                <IconButton color="info" onClick={() => handleOpen(c)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xóa">
                                                <span>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(c.id)}
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
                        count={filteredCategories.length}
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
                <DialogTitle>{editCategory ? 'Sửa loại sản phẩm' : 'Thêm loại sản phẩm mới'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tên loại"
                                name="categoryName"
                                fullWidth
                                required
                                inputProps={{ maxLength: 255 }}
                                value={form.categoryName}
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
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageCategories;
