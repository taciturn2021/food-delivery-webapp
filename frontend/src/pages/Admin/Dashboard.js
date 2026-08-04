import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ManagementShell from '../../components/management/ManagementShell';
import BranchManagement from './components/BranchManagement';
import MenuManagement from './components/MenuManagement';
import AdminSettings from './components/AdminSettings';

const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ManagementShell type="admin">
            <Routes>
                <Route path="/" element={<Navigate to="/admin/menu" replace />} />
                <Route path="/menu" element={<MenuManagement />} />
                <Route path="/branches" element={<BranchManagement />} />
                <Route path="/settings" element={<AdminSettings />} />
            </Routes>
        </ManagementShell>
    );
};

export default AdminDashboard;