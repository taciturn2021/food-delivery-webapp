import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Check, Clock3, MapPin, RefreshCw, ShoppingBag, Store, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCustomerActiveOrders } from '../../../../services/api';
import CustomerHeader from '../../../../components/customer/CustomerHeader';
import { CustomerEmpty, CustomerError, CustomerLoading } from '../../../../components/customer/CustomerStates';

export const orderStatusConfig = {
    pending: { label: 'Pending', tone: 'bg-[var(--customer-soft)] text-[var(--customer-gold)]', icon: Clock3 },
    preparing: { label: 'Preparing', tone: 'bg-[var(--customer-soft)] text-[#8eb4d0]', icon: ShoppingBag },
    delivering: { label: 'Out for delivery', tone: 'bg-[var(--customer-selected)] text-[var(--customer-coral)]', icon: MapPin },
    delivered: { label: 'Delivered', tone: 'bg-[var(--customer-sage-soft)] text-[var(--customer-sage)]', icon: Check },
    cancelled: { label: 'Cancelled', tone: 'bg-[var(--customer-danger-soft)] text-[var(--customer-coral)]', icon: X }
};

const formatPrice = (price) => {
    const numericPrice = Number.parseFloat(price);
    return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00';
};

const ActiveOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCustomerActiveOrders();
            setOrders(response.data);
            setError('');
        } catch (fetchError) {
            console.error('Error fetching active orders:', fetchError);
            setError('We could not load your active orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = window.setInterval(fetchOrders, 60000);
        return () => window.clearInterval(interval);
    }, [fetchOrders]);

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader />
            <main className="customer-container pt-[7.5rem]">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div><p className="customer-eyebrow">Keep an eye on dinner</p><h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Active orders</h1></div>
                    <div className="flex gap-2">
                        <button type="button" onClick={fetchOrders} className="flex items-center gap-2 rounded-full border border-[var(--customer-line)] px-4 py-2.5 text-sm font-bold transition hover:border-[var(--customer-coral)]"><RefreshCw className="h-4 w-4" /> Refresh</button>
                        <button type="button" onClick={() => navigate('/customer/orders/history')} className="flex items-center gap-2 rounded-full bg-[var(--customer-coral)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]">History <ArrowRight className="h-4 w-4" /></button>
                    </div>
                </div>

                {loading ? <CustomerLoading label="Checking with the kitchen..." /> : error ? <CustomerError message={error} onRetry={fetchOrders} /> : !orders.length ? (
                    <CustomerEmpty title="No active orders" description="Your next meal will appear here once you place an order." action={<button type="button" onClick={() => navigate('/')} className="mt-3 rounded-full bg-[var(--customer-coral)] px-5 py-3 text-sm font-bold text-white">Browse the menu</button>} />
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {orders.map((order) => {
                            const config = orderStatusConfig[order.status] || orderStatusConfig.pending;
                            const StatusIcon = config.icon;
                            return (
                                <article key={order.id} className="customer-surface p-5 transition hover:-translate-y-0.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--customer-muted)]">Order #{order.id}</p><p className="mt-2 text-lg font-bold">{order.branch_name}</p></div>
                                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${config.tone}`}><StatusIcon className="h-3.5 w-3.5" /> {config.label}</span>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-[var(--customer-line)] pt-4 text-sm">
                                        <span className="flex items-center gap-2 text-[var(--customer-muted)]"><Store className="h-4 w-4" /> {order.items?.length || 0} items</span>
                                        <span className="font-black text-[var(--customer-coral-dark)]">${formatPrice(order.total_amount)}</span>
                                    </div>
                                    <button type="button" onClick={() => navigate(`/customer/orders/${order.id}`)} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--customer-coral)] text-sm font-bold text-white transition hover:bg-[var(--customer-coral-dark)]">Track order <ArrowRight className="h-4 w-4" /></button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ActiveOrders;
