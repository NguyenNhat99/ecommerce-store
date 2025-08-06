import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    AppBar, Drawer, Menu, IconButton, Divider, CssBaseline,
    Box, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Toolbar, Typography, Tooltip, Avatar, MenuItem
} from "@mui/material";

import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Dashboard as DashboardIcon,
    FormatListBulleted as FormatListBulletedIcon,
    Category as CategoryIcon,
    Label as LabelIcon,
    Article as ArticleIcon
} from "@mui/icons-material";
import ColorLensIcon from '@mui/icons-material/ColorLens';

import { useNavigate } from "react-router-dom";
import authService from "../../service/authService";
import { motion } from "framer-motion";

const drawerWidth = 240;

const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { label: "Sản phẩm", icon: <FormatListBulletedIcon />, path: "/admin/san-pham" },
    { label: "Loại sản phẩm", icon: <CategoryIcon />, path: "/admin/loai-san-pham" },
    { label: "Thương hiệu", icon: <LabelIcon />, path: "/admin/thuong-hieu" },
];

function AdminLayout({ children }) {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleToggleDrawer = () => setMobileOpen(!mobileOpen);
    const handleCloseDrawer = () => setMobileOpen(false);

    const handleUserMenuOpen = (event) => setAnchorElUser(event.currentTarget);
    const handleUserMenuClose = () => setAnchorElUser(null);

    const handleLogout = () => {
        authService.logout();
        navigate("/dang-nhap");
    };

    const handleNavigate = (path) => {
        navigate(path);
        handleCloseDrawer();
    };

    const drawer = (
        <Box>
            <Box sx={{ p: 2, textAlign: "center" }}>
                <img src="/logo.svg" alt="Logo" width={40} />
                <Typography variant="h6" fontWeight="bold" mt={1}>
                    Trang quản trị
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                mx: 1,
                                my: 0.5,
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: "#e3f2fd"
                                }
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ width:'100vw',display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    background: "linear-gradient(to right, #4e54c8, #8f94fb)",
                    color: "white",
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    boxShadow: "0 3px 8px rgba(0,0,0,0.2)"
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleToggleDrawer}
                        sx={{ mr: 2, display: { md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    {/*<Typography variant="h6" noWrap component="div">*/}
                    {/*    Trang quản trị*/}
                    {/*</Typography>*/}
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title="Cài đặt tài khoản">
                        <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                            <Avatar alt="Admin" src="/static/images/avatar/2.jpg" />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorElUser}
                        open={Boolean(anchorElUser)}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        sx={{ mt: "45px" }}
                    >
                        {/*<MenuItem disabled>*/}
                        {/*    <Box>*/}
                        {/*        <Typography fontWeight="bold">Admin</Typography>*/}
                        {/*        <Typography variant="caption">admin@example.com</Typography>*/}
                        {/*    </Box>*/}
                        {/*</MenuItem>*/}
                        <Divider />
                        <MenuItem onClick={() => handleNavigate("/admin/thong-tin-ca-nhan")}>
                            <Typography>Thông tin cá nhân</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Typography>Đăng xuất</Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleCloseDrawer}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box"
                        }
                    }}
                >
                    <Box sx={{ p: 1 }}>
                        <IconButton onClick={handleCloseDrawer}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {drawer}
                </Drawer>

                {/* Drawer permanent cho desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            borderRight: "1px solid #e0e0e0"
                        }
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Nội dung chính */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    minHeight: '100vh',
                    px: { xs: 1, sm: 2, md: 3 },
                    pt: 3,
                    pb: 4,
                    overflowX: 'hidden'
                }}
            >
                <Toolbar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: "100%" }}
                >
                    {children}
                </motion.div>
            </Box>
        </Box>
    );
}

AdminLayout.propTypes = {
    children: PropTypes.node
};

export default React.memo(AdminLayout);
