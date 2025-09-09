import React, { useContext, useState, lazy, Suspense } from "react";
import {
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
    Box,
    CircularProgress,
} from "@mui/material";
import AuthContext from "../../../context/AuthContext";
import CustomizedSnackbars from "../../../components/Snackbar/Alert";

// Lazy load pages
const InformationPage = lazy(() => import("./Information"));
const ChangePasswordPage = lazy(() => import("./ChangePassword"));

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [tabIndex, setTabIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, content: "", status: "" });

    const handleTabChange = (_, newIndex) => setTabIndex(newIndex);
    const handleSnackbar = (data) => setSnackbar(data);
    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    if (!user) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <CustomizedSnackbars
                open={snackbar.open}
                status={snackbar.status}
                content={snackbar.content}
                onClose={handleCloseSnackbar}
            />

            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Trang cá nhân
                </Typography>

                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="tabs-profile"
                    sx={{ mb: 3 }}
                >
                    <Tab label="Thông tin cá nhân" />
                    <Tab label="Đổi mật khẩu" />
                </Tabs>

                <Suspense fallback={<Box textAlign="center"><CircularProgress /></Box>}>
                    {tabIndex === 0 && <InformationPage user={user} onSnackbar={handleSnackbar} />}
                    {tabIndex === 1 && <ChangePasswordPage onSnackbar={handleSnackbar} />}
                </Suspense>
            </Paper>
        </Container>
    );
};

export default ProfilePage;
