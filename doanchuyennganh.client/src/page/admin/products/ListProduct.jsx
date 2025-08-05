import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Breadcrumbs, Link, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow, Collapse,
    IconButton, Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    KeyboardArrowDown,
    KeyboardArrowUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DialogsProvider, useDialogs } from '@toolpad/core/useDialogs';
import productService from '../../../service/productService';

function Row({ row, onDeleted }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dialogs = useDialogs();

    const handleDelete = async () => {
        const confirmed = await dialogs.confirm(`Xác nhận xóa ${row.name}?`, {
            okText: "Xóa", cancelText: "Hủy"
        });
        if (confirmed) {
            try {
                await productService.deleteOne(row.id);
                onDeleted(row.id);
                await dialogs.alert("Xóa thành công");
            } catch {
                await dialogs.alert("Xóa thất bại");
            }
        }
    };
    return (
        <>
            <TableRow hover>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{row.price?.toLocaleString()}₫</TableCell>
                <TableCell align="right">{row.originalPrice?.toLocaleString()}₫</TableCell>
                <TableCell align="right">{row.stock}</TableCell>
                <TableCell align="right">
                    <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => navigate(`sua/${row.id}`)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <IconButton onClick={handleDelete}><DeleteIcon /></IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Kích thước sản phẩm
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Kích thước</TableCell>
                                        <TableCell align="right">Số lượng tồn</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.productSizes?.map((size) => (
                                        <TableRow key={size.sizeId}>
                                            <TableCell>{size.sizeName}</TableCell>
                                            <TableCell align="right">{size.stock}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function ListProductPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getAll();
                setProducts(data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const filtered = products.filter((p) =>
        [p.name, p.price, p.originalPrice, p.stock]
            .some(field => field?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DialogsProvider>
            <Box sx={{ width: '100%', height: '100%', px: 0 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link underline="hover" color="inherit" href="/admin/dashboard">
                        Dashboard
                    </Link>
                    <Typography color="text.primary">Sản phẩm</Typography>
                </Breadcrumbs>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Danh sách sản phẩm
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ ml: "auto", borderRadius: 2 }}
                        onClick={() => navigate("/admin/san-pham/them")}
                    >
                        Thêm sản phẩm
                    </Button>
                </Box>

                <TextField
                    label="Tìm kiếm sản phẩm"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden", width: '100%' }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Tên</TableCell>
                                    <TableCell align="right">Giá hiện tại</TableCell>
                                    <TableCell align="right">Giá gốc</TableCell>
                                    <TableCell align="right">Kho</TableCell>
                                    <TableCell align="right">Lệnh</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <Row
                                            key={row.id}
                                            row={row}
                                            onDeleted={(deletedId) =>
                                                setProducts((prev) => prev.filter((p) => p.id !== deletedId))
                                            }
                                        />
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Paper>
            </Box>
        </DialogsProvider>
    );
}
