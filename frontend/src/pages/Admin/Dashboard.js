import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminOverview from './components/AdminOverview';
import BranchManagement from './components/BranchManagement';
import MenuManagement from './components/MenuManagement';
import AdminSettings from './components/AdminSettings';

const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AdminHeader 
                sidebarOpen={sidebarOpen} 
                onSidebarToggle={handleSidebarToggle} 
            />
            <AdminSidebar 
                open={sidebarOpen}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    pt: { xs: 7, sm: 8 },
                    px: { xs: 2, sm: 3 },
                    pb: 3,
                    backgroundColor: 'background.default',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="xl">
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="/menu" element={<MenuManagement />} />
                        <Route path="/branches" element={<BranchManagement />} />
                        <Route path="/settings" element={<AdminSettings />} />
                    </Routes>
                </Container>
            </Box>
        </Box>
    );
};

export default AdminDashboard;