import { useState, useEffect } from 'react';
import ManagementShell from '../../components/management/ManagementShell';
import BranchOverview from './components/BranchOverview';
import BranchSettings from './components/BranchSettings';
import BranchMenu from './components/BranchMenu';
import OrderManagement from './components/OrderManagement';
import RiderManagement from './components/RiderManagement';
import { getOrders } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BranchDashboard = () => {
    const [selectedSection, setSelectedSection] = useState('overview');
    const [orders, setOrders] = useState([]);
    const { user } = useAuth();

    // Fetch orders data
    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await getOrders({ branch_id: user.branchId });
                if (response && response.data) {
                    setOrders(response.data.map(order => ({
                        ...order,
                        total: parseFloat(order.total_amount || 0)
                    })));
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        };

        loadOrders();
        const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [user.branchId]);

    const renderContent = () => {
        switch (selectedSection) {
            case 'overview':
                return <BranchOverview orders={orders} onSectionChange={setSelectedSection} />;
            case 'orders':
                return <OrderManagement />;
            case 'menu':
                return <BranchMenu />;
            case 'riders':
                return <RiderManagement branchId={user.branchId} />;
            case 'settings':
                return <BranchSettings />;
            default:
                return <BranchOverview orders={orders} onSectionChange={setSelectedSection} />;
        }
    };

    return (
        <ManagementShell
            type="branch"
            activeSection={selectedSection}
            onSectionChange={setSelectedSection}
        >
            {renderContent()}
        </ManagementShell>
    );
};

export default BranchDashboard;