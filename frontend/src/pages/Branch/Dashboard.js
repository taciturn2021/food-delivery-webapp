import { useCallback, useEffect, useRef, useState } from 'react';
import ManagementShell from '../../components/management/ManagementShell';
import BranchOverview from './components/BranchOverview';
import BranchSettings from './components/BranchSettings';
import BranchMenu from './components/BranchMenu';
import OrderManagement from './components/OrderManagement';
import RiderManagement from './components/RiderManagement';
import { getBranchOrders } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const normalizeOrder = (order) => ({
    ...order,
    customerName: order.customer_name,
    total: parseFloat(order.total_amount || 0),
    items: order.items || [],
    time: new Date(order.created_at).toLocaleString(),
    rider_name: order.rider_name || order.rider_first_name,
    rider_phone: order.rider_phone
});

const BranchDashboard = () => {
    const [selectedSection, setSelectedSection] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersRefreshing, setOrdersRefreshing] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [newOrderIds, setNewOrderIds] = useState([]);
    const { user } = useAuth();
    const lastSyncRef = useRef(null);
    const knownOrderIdsRef = useRef(null);
    const requestInFlightRef = useRef(false);

    const updateLocalOrder = useCallback((orderId, changes) => {
        setOrders((current) => current.map((order) => (
            order.id === orderId ? { ...order, ...changes } : order
        )));
    }, []);

    const loadOrders = useCallback(async ({ forceFull = false } = {}) => {
        const branchId = user?.branchId;
        if (!branchId || requestInFlightRef.current) return;

        requestInFlightRef.current = true;
        const requestStartedAt = new Date().toISOString();
        const isFullLoad = forceFull || !lastSyncRef.current;
        setOrdersRefreshing(true);
        if (isFullLoad) setOrdersLoading(true);

        try {
            const params = {
                branch_id: branchId,
                limit: 100
            };
            if (!isFullLoad) params.updated_after = lastSyncRef.current;

            const response = await getBranchOrders(params);
            const payload = response.data || {};
            const incomingOrders = (payload.orders || []).map(normalizeOrder);
            const previousIds = knownOrderIdsRef.current;
            const incomingIds = incomingOrders.map((order) => order.id);

            if (previousIds) {
                const unseenIds = incomingIds.filter((id) => !previousIds.has(id));
                if (unseenIds.length > 0) {
                    setNewOrderIds((current) => [...new Set([...current, ...unseenIds])]);
                }
            }

            if (isFullLoad) {
                setOrders(incomingOrders);
                knownOrderIdsRef.current = new Set(incomingIds);
            } else if (incomingOrders.length > 0) {
                setOrders((current) => {
                    const orderMap = new Map(current.map((order) => [order.id, order]));
                    incomingOrders.forEach((order) => orderMap.set(order.id, order));
                    return Array.from(orderMap.values());
                });
                knownOrderIdsRef.current = new Set([
                    ...(knownOrderIdsRef.current || []),
                    ...incomingIds
                ]);
            }

            lastSyncRef.current = payload.sync_cursor || requestStartedAt;
            setOrderError(null);
        } catch (error) {
            console.error('Error loading branch orders:', error);
            setOrderError(error.response?.data?.message || 'Failed to load orders');
        } finally {
            requestInFlightRef.current = false;
            setOrdersRefreshing(false);
            setOrdersLoading(false);
        }
    }, [user?.branchId]);

    useEffect(() => {
        const shouldPollOrders = selectedSection === 'overview' || selectedSection === 'orders';
        if (!user?.branchId || !shouldPollOrders) return undefined;

        loadOrders();
        const interval = setInterval(() => loadOrders(), 10000);
        return () => clearInterval(interval);
    }, [loadOrders, selectedSection, user?.branchId]);

    const renderContent = () => {
        switch (selectedSection) {
            case 'overview':
                return <BranchOverview orders={orders} onSectionChange={setSelectedSection} />;
            case 'orders':
                return (
                    <OrderManagement
                        orders={orders}
                        loading={ordersLoading}
                        refreshing={ordersRefreshing}
                        error={orderError}
                        newOrderIds={newOrderIds}
                        onAcknowledgeNewOrders={() => setNewOrderIds([])}
                        onRefresh={() => loadOrders({ forceFull: true })}
                        onOrderChange={updateLocalOrder}
                    />
                );
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
