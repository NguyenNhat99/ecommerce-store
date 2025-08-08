import React, { useEffect, useState } from "react";
import {
    Box, Typography, Button, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Snackbar, MenuItem, Select, FormControl, InputLabel, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Divider, Avatar, Breadcrumbs, Link, TextField, CircularProgress
} from "@mui/material";
import { Lock, LockOpen, Delete, InfoOutlined } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import authService from "../../../service/authService";

// Dữ liệu ảo mẫu đơn hàng
const MOCK_ORDERS = [
    { id: "HD001", status: "Delivered", total: 200000, date: "2024-07-10", address: "Hà Nội", items: [{ name: "Áo thun", qty: 2 }] },
    { id: "HD002", status: "Shipping", total: 450000, date: "2024-07-15", address: "Đà Nẵng", items: [{ name: "Quần jeans", qty: 1 }] },
    { id: "HD003", status: "Cancelled", total: 150000, date: "2024-07-18", address: "TP.HCM", items: [{ name: "Áo sơ mi", qty: 1 }] },
    { id: "HD004", status: "Delivered", total: 340000, date: "2024-08-01", address: "Cần Thơ", items: [{ name: "Áo khoác", qty: 1 }] },
    { id: "HD005", status: "Shipping", total: 670000, date: "2024-08-03", address: "Nghệ An", items: [{ name: "Giày sneaker", qty: 2 }] },
    { id: "HD006", status: "Delivered", total: 215000, date: "2024-08-05", address: "Bình Dương", items: [{ name: "Mũ lưỡi trai", qty: 3 }] },
    { id: "HD007", status: "Cancelled", total: 380000, date: "2024-08-06", address: "Đồng Nai", items: [{ name: "Túi xách", qty: 1 }] }
];
const STATUS_COLOR = { Delivered: "success", Shipping: "info", Cancelled: "error" };
const avatarColors = ["#FF6F61", "#00897B", "#3949AB", "#6D4C41", "#C2185B"];
const getInitials = (firstName, lastName) => (firstName?.[0] || "") + (lastName?.[0] || "");
const ROLE_DISPLAY = {
    "Admin": { label: "Admin", color: "error" },
    "Staff": { label: "Nhân viên", color: "info" },
    "Customer": { label: "Khách hàng", color: "success" },
    "User": { label: "User", color: "default" },
};

const DetailAccount = () => {
    const { email } = useParams();
    const [account, setAccount] = useState(null);
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phoneNumber: "", address: "", gender: true
    });
    const [role, setRole] = useState(""); // chỉ hiển thị, ko cập nhật qua API
    const [lockStatus, setLockStatus] = useState(false); // chưa có API
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [orderDetailDialog, setOrderDetailDialog] = useState({ open: false, order: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Đơn hàng
    const [orderPage, setOrderPage] = useState(0);
    const [ordersPerPage, setOrdersPerPage] = useState(5);
    const orders = MOCK_ORDERS;
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
    const shippingOrders = orders.filter(o => o.status === "Shipping").length;
    const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;
    const totalMoney = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0), 0);
    const pagedOrders = orders.slice(orderPage * ordersPerPage, orderPage * ordersPerPage + ordersPerPage);

    useEffect(() => {
        if (!email) return;
        setLoading(true);
        authService.getAccountDetail(email)
            .then(data => {
                setAccount(data);
                setForm({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    address: data.address || "",
                    gender: !!data.gender,
                });
                setRole(data.role);
                setLockStatus(false); // Chưa có trường lock thực tế
            })
            .catch(err => {
                setSnackbar({ open: true, message: err.message || "Không thể lấy dữ liệu tài khoản!", severity: "error" });
                setAccount(null);
            })
            .finally(() => setLoading(false));
    }, [email]);

    // Cập nhật form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "gender" ? value === "true" : value
        }));
    };

    // Lưu thông tin tài khoản
    const handleSave = async () => {
        setSaving(true);
        try {
            await authService.updateInformation(form);
            setSnackbar({ open: true, message: "Cập nhật thông tin thành công", severity: "success" });
        } catch (error) {
            setSnackbar({ open: true, message: error?.message || "Lỗi cập nhật thông tin!", severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    // Xóa tài khoản
    const handleDelete = () => setDeleteDialog(true);
    const confirmDelete = () => {
        setDeleteDialog(false);
        setSnackbar({ open: true, message: "Đã xóa tài khoản", severity: "error" });
        // TODO: call API & redirect nếu cần
    };

    // Khóa/mở khóa tài khoản
    const handleToggleLock = () => {
        setLockStatus(prev => !prev);
        setSnackbar({
            open: true,
            message: !lockStatus ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
            severity: !lockStatus ? "warning" : "success"
        });
    };

    // Mở chi tiết đơn hàng
    const handleOrderDetail = (order) => {
        setOrderDetailDialog({ open: true, order });
    };

    // Đóng dialog chi tiết đơn hàng
    const closeOrderDetail = () => {
        setOrderDetailDialog({ open: false, order: null });
    };

    return (
        <Box width='100%' margin="0 auto">
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="/admin/dashboard">Dashboard</Link>
                <Link underline="hover" color="inherit" href="/admin/quan-ly-tai-khoan">Quản lý tài khoản</Link>
                <Typography color="text.primary">Chi tiết tài khoản</Typography>
            </Breadcrumbs>
            <Typography variant="h5" fontWeight="bold" mb={2}>Chi tiết tài khoản</Typography>

            {loading ? (
                <Box textAlign="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : account ? (
                <Grid container spacing={3}>
                    <Grid item md={12}>
                        <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={3}
                            >
                                <Stack alignItems="center" spacing={1} >
                                    <Avatar
                                        sx={{
                                            bgcolor: avatarColors[form.firstName.charCodeAt(0) % avatarColors.length],
                                            width: 80, height: 80, fontSize: 32,
                                        }}
                                    >
                                        {getInitials(form.firstName, form.lastName)}
                                    </Avatar>
                                    <Typography variant="h6">{form.firstName} {form.lastName}</Typography>
                                    <Chip
                                        label={ROLE_DISPLAY[role]?.label || role}
                                        color={ROLE_DISPLAY[role]?.color || "default"}
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">{form.email}</Typography>
                                </Stack>
                                <Box flex={1} width="100%">
                                    <Stack  spacing={2} sx={{ mb: 1 }}>
                                        <TextField
                                            label="Họ"
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            size="small"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Tên"
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            size="small"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Số điện thoại"
                                            name="phoneNumber"
                                            value={form.phoneNumber}
                                            onChange={handleChange}
                                            size="small"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Địa chỉ"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            size="small"
                                            fullWidth
                                            />
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Giới tính</InputLabel>
                                            <Select
                                                name="gender"
                                                value={form.gender ? "true" : "false"}
                                                label="Giới tính"
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="true">Nam</MenuItem>
                                                <MenuItem value="false">Nữ</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Quyền</InputLabel>
                                            <Select
                                                value={role}
                                                label="Quyền"
                                                onChange={e => setRole(e.target.value)}
                                            >
                                                <MenuItem value="Staff">Nhân viên</MenuItem>
                                                <MenuItem value="Customer">Khách hàng</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? "Đang lưu..." : "Lưu thông tin"}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color={lockStatus ? "success" : "error"}
                                            startIcon={lockStatus ? <LockOpen /> : <Lock />}
                                            onClick={handleToggleLock}
                                        >
                                            {lockStatus ? "Mở khóa" : "Khóa"}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Delete />}
                                            onClick={handleDelete}
                                        >
                                            Xóa
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item md={12}>
                        <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h6" mb={2}><b>Thống kê đơn hàng</b></Typography>
                            <Grid container spacing={1} mb={2}>
                                <Grid item><Chip label={`Tổng đơn: ${totalOrders}`} color="default" sx={{ fontWeight: 600 }} /></Grid>
                                <Grid item><Chip label={`Thành công: ${deliveredOrders}`} color="success" sx={{ fontWeight: 600 }} /></Grid>
                                <Grid item><Chip label={`Đang giao: ${shippingOrders}`} color="info" sx={{ fontWeight: 600 }} /></Grid>
                                <Grid item><Chip label={`Đã hủy: ${cancelledOrders}`} color="error" sx={{ fontWeight: 600 }} /></Grid>
                                <Grid item><Chip label={`Tổng tiền: ${totalMoney.toLocaleString()} đ`} color="warning" sx={{ fontWeight: 600 }} /></Grid>
                            </Grid>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Mã đơn</TableCell>
                                            <TableCell>Ngày</TableCell>
                                            <TableCell>Trạng thái</TableCell>
                                            <TableCell align="right">Tổng tiền</TableCell>
                                            <TableCell align="center">Hành động</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pagedOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{order.date}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            order.status === "Delivered"
                                                                ? "Thành công"
                                                                : order.status === "Shipping"
                                                                    ? "Đang vận chuyển"
                                                                    : "Đã hủy"
                                                        }
                                                        color={STATUS_COLOR[order.status]}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {order.total.toLocaleString()} đ
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<InfoOutlined />}
                                                        onClick={() => handleOrderDetail(order)}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {pagedOrders.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    Không có đơn hàng nào.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={orders.length}
                                page={orderPage}
                                onPageChange={(e, newPage) => setOrderPage(newPage)}
                                rowsPerPage={ordersPerPage}
                                onRowsPerPageChange={e => {
                                    setOrdersPerPage(parseInt(e.target.value, 10));
                                    setOrderPage(0);
                                }}
                                labelRowsPerPage="Đơn/trang:"
                                rowsPerPageOptions={[3, 5, 10, 25]}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            ) : (
                <Typography color="error" align="center" py={4}>Không tìm thấy tài khoản!</Typography>
            )}

            {/* Dialog xác nhận xóa */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc muốn xóa tài khoản <b>{form.firstName} {form.lastName}</b> ({form.email}) không? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>Xóa</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog chi tiết đơn hàng */}
            <Dialog
                open={orderDetailDialog.open}
                onClose={closeOrderDetail}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Chi tiết đơn hàng {orderDetailDialog.order?.id}</DialogTitle>
                <DialogContent dividers>
                    {orderDetailDialog.order ? (
                        <Box>
                            <Typography><b>Ngày đặt:</b> {orderDetailDialog.order.date}</Typography>
                            <Typography><b>Trạng thái:</b> {orderDetailDialog.order.status}</Typography>
                            <Typography><b>Địa chỉ:</b> {orderDetailDialog.order.address}</Typography>
                            <Typography><b>Tổng tiền:</b> {orderDetailDialog.order.total.toLocaleString()} đ</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography><b>Danh sách sản phẩm:</b></Typography>
                            <ul style={{ marginTop: 4, marginBottom: 0 }}>
                                {orderDetailDialog.order.items?.map((item, idx) => (
                                    <li key={idx}>
                                        {item.name} <span style={{ color: "#666" }}>x{item.qty}</span>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeOrderDetail} autoFocus>Đóng</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Box>
    );
};

export default DetailAccount;
