import { useState } from 'react';
import { Box, CssBaseline, Container } from '@mui/material';
import BranchSidebar from './components/BranchSidebar';
import BranchHeader from './components/BranchHeader';
import BranchOverview from './components/BranchOverview';
import BranchSettings from './components/BranchSettings';
import BranchMenu from './components/BranchMenu';
import OrderManagement from './components/OrderManagement';

const BranchDashboard = () => {
    const [selectedSection, setSelectedSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'overview':
                return <BranchOverview />;
            case 'orders':
                return <OrderManagement />;
            case 'menu':
                return <BranchMenu />;
            case 'settings':
                return <BranchSettings />;
            default:
                return <BranchOverview />;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <BranchHeader 
                sidebarOpen={sidebarOpen} 
                onSidebarToggle={handleSidebarToggle} 
            />
            <BranchSidebar 
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

export default BranchDashboard;