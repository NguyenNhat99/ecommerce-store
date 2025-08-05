import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Grid, Tooltip, InputAdornment, Pagination, Breadcrumbs, Link,
    Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Search } from '@mui/icons-material';
import brandService from '../../../service/brandService';

const rowsPerPage = 5;

const ManageBrands = () => {
    const [brands, setBrands] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);

    const [open, setOpen] = useState(false);
    const [editBrand, setEditBrand] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchBrands = async () => {
        try {
            const data = await brandService.getAll();
            setBrands(data);
            setPage(1);
        } catch (error) {
            showSnackbar(error, 'error');
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const filteredBrands = useMemo(() => {
        return brands.filter(b =>
            b.name.toLowerCase().includes(searchText.trim().toLowerCase())
        );
    }, [brands, searchText]);

    const displayedBrands = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredBrands.slice(start, start + rowsPerPage);
    }, [filteredBrands, page]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

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
            showSnackbar(err, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa thương hiệu này?")) return;

        try {
            await brandService.deleteOne(id);
            setBrands(prev => prev.filter(b => b.id !== id));
            showSnackbar('Xóa thành công');
        } catch (err) {
            showSnackbar(err, 'error');
        }
    };

    const handleResetSearch = () => {
        setSearchText('');
        setPage(1);
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
                        onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end"><Search /></InputAdornment>,
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
                    <Button variant="contained" onClick={() => setPage(1)} sx={{ mr: 1 }}>Tìm kiếm</Button>
                    <Button variant="outlined" onClick={handleResetSearch} sx={{ mr: 1 }}>Xóa lọc</Button>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBrands}>Làm mới</Button>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Tên thương hiệu</strong></TableCell>
                            <TableCell><strong>Mô tả</strong></TableCell>
                            <TableCell align="center"><strong>Thao tác</strong></TableCell>
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
                                    <TableCell>{b.id}</TableCell>
                                    <TableCell>{b.name}</TableCell>
                                    <TableCell>{b.description}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Sửa">
                                            <Button size="small" onClick={() => handleOpen(b)}>
                                                <Edit fontSize="small" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <Button size="small" color="error" onClick={() => handleDelete(b.id)}>
                                                <Delete fontSize="small" />
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                    count={Math.ceil(filteredBrands.length / rowsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>

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
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageBrands;
