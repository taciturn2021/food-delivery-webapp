import { useState } from 'react';
import { Box, CssBaseline, Container } from '@mui/material';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminOverview from './components/AdminOverview';
import BranchManagement from './components/BranchManagement';
import MenuManagement from './components/MenuManagement';
import AdminSettings from './components/AdminSettings';

const AdminDashboard = () => {
    const [selectedSection, setSelectedSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'overview':
                return <AdminOverview />;
            case 'branches':
                return <BranchManagement />;
            case 'menu':
                return <MenuManagement />;
            case 'settings':
                return <AdminSettings />;
            default:
                return <AdminOverview />;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AdminHeader 
                sidebarOpen={sidebarOpen} 
                onSidebarToggle={handleSidebarToggle} 
            />
            <AdminSidebar 
                open={sidebarOpen} 
                onClose={handleSidebarToggle}
                selectedSection={selectedSection}
                onSectionChange={setSelectedSection}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                    pt: 8,
                    px: 3,
                    backgroundColor: (theme) => theme.palette.grey[100]
                }}
            >
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {renderContent()}
                </Container>
            </Box>
        </Box>
    );
};

export default AdminDashboard;