import React, { useEffect, useState } from "react";
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Tooltip, Snackbar,
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField, TablePagination, Breadcrumbs, Link, Chip
} from "@mui/material";
import { Delete, InfoOutlined, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import authService from "../../../service/authService";

const ROLE_DISPLAY = {
    "Admin": { label: "Admin", color: "error" },
    "Staff": { label: "Nhân viên", color: "info" },
    "Customer": { label: "Khách hàng", color: "success" },
    "User": { label: "User", color: "default" },
};

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    // Lấy dữ liệu thật từ API
    useEffect(() => {
        let mounted = true;
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const data = await authService.getAllAccounts();
                if (mounted) setUsers(data);
            } catch (error) {
                setSnackbar({ open: true, message: error?.message || "Lỗi khi lấy danh sách tài khoản!", severity: "error" });
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchUsers();
        return () => { mounted = false; }
    }, []);

    // Lọc search
    const filteredUsers = users.filter(
        (user) =>
            user.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.lastName.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Phân trang
    const usersToShow = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Xử lý xóa
    const handleDeleteUser = (user) => setDeleteDialog({ open: true, user });
    const confirmDelete = async () => {
        setDeleting(true);
        setTimeout(() => {
            setUsers(prev => prev.filter(u => u.email !== deleteDialog.user.email));
            setSnackbar({ open: true, message: "Đã xóa tài khoản!", severity: "success" });
            setDeleteDialog({ open: false, user: null });
            setDeleting(false);
        }, 700);
    };

    // Chuyển trang chi tiết
    const handleGoToDetail = (user) => {
        navigate(`/admin/quan-ly-tai-khoan/chi-tiet/${encodeURIComponent(user.email)}`);
        // Nếu dùng ROUTERS thì dùng ROUTERS.ADMIN.ACCOUNT_DETAIL.replace(":email", encodeURIComponent(user.email))
    };

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" href="/admin/dashboard">Dashboard</Link>
                <Typography color="text.primary">Quản lý tài khoản</Typography>
            </Breadcrumbs>
            <Typography variant="h5" gutterBottom>Danh sách tài khoản</Typography>

            {/* Thanh tìm kiếm và thêm mới */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                    label="Tìm kiếm tên/email"
                    variant="outlined"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    size="small"
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    disabled
                >
                    Thêm tài khoản
                </Button>
            </Box>

            {loading ? (
                <Box textAlign="center" my={2}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Họ tên</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Vai trò</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Địa chỉ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usersToShow.map((user, idx) => (
                                <TableRow key={user.email}>
                                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ROLE_DISPLAY[user.role]?.label || user.role}
                                            color={ROLE_DISPLAY[user.role]?.color || "default"}
                                            size="small"
                                            sx={{ fontWeight: 600, textTransform: "uppercase" }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span style={{ color: "green" }}>Hoạt động</span>
                                    </TableCell>
                                    <TableCell>{user.address}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Chi tiết">
                                            <IconButton color="info" onClick={() => handleGoToDetail(user)}>
                                                <InfoOutlined />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={user.role === "Admin" ? "Không thể xóa Admin" : "Xóa"}>
                                            <span>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={user.role === "Admin" || deleting}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {usersToShow.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Không có tài khoản nào phù hợp.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={e => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        labelRowsPerPage="Số dòng/trang:"
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    />
                </TableContainer>
            )}

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc muốn xóa tài khoản "<b>{deleteDialog.user?.firstName} {deleteDialog.user?.lastName}</b>"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Hủy</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>Xóa</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={1800}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Box>
    );
};

export default UserListPage;
