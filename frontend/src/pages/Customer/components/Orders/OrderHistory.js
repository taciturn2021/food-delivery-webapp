import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Search, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCustomerOrderHistory } from '../../../../services/api';
import CustomerHeader from '../../../../components/customer/CustomerHeader';
import { CustomerEmpty, CustomerError, CustomerLoading } from '../../../../components/customer/CustomerStates';
import { orderStatusConfig } from './ActiveOrders';

const formatPrice = (price) => {
    const numericPrice = Number.parseFloat(price);
    return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00';
};

const formatAddress = (address) => {
    if (!address) return 'No address information';
    const parsed = typeof address === 'string' ? JSON.parse(address) : address;
    return `${parsed.street || parsed.street_address || 'Address'}, ${parsed.city || ''}`;
};

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async (pageNumber = page) => {
        try {
            setLoading(true);
            const response = await getCustomerOrderHistory(pageNumber);
            const loadedOrders = response.data.orders || [];
            setOrders(loadedOrders);
            setFilteredOrders(loadedOrders);
            setTotalPages(response.data.totalPages || 1);
            setError('');
        } catch (fetchError) {
            console.error('Error fetching order history:', fetchError);
            setError('We could not load your order history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        setFilteredOrders(!term ? orders : orders.filter((order) => String(order.id).includes(term) || order.branch_name?.toLowerCase().includes(term)));
    }, [orders, searchTerm]);

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader />
            <main className="customer-container pt-[7.5rem]">
                <div className="mb-8 flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/customer/orders')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] transition hover:border-[var(--customer-coral)]"><ArrowLeft className="h-4 w-4" /></button>
                    <div><p className="customer-eyebrow">Your table memories</p><h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Order history</h1></div>
                </div>

                <label className="customer-surface relative mb-6 block p-2">
                    <span className="sr-only">Search orders</span>
                    <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--customer-muted)]" />
                    <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by order number or branch" className="customer-focus h-11 w-full rounded-xl bg-transparent pl-10 pr-4 text-sm outline-none" />
                </label>

                {loading ? <CustomerLoading label="Pulling up your past orders..." /> : error ? <CustomerError message={error} onRetry={() => fetchOrders(page)} /> : !filteredOrders.length ? (
                    <CustomerEmpty title={searchTerm ? 'No matching orders' : 'No past orders'} description={searchTerm ? 'Try a different order number or branch name.' : 'Your completed orders will live here.'} action={<button type="button" onClick={() => navigate('/')} className="mt-3 rounded-full bg-[var(--customer-coral)] px-5 py-3 text-sm font-bold text-white">Browse the menu</button>} />
                ) : (
                    <>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {filteredOrders.map((order) => {
                                const config = orderStatusConfig[order.status] || orderStatusConfig.delivered;
                                const StatusIcon = config.icon;
                                return (
                                    <article key={order.id} className="customer-surface p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--customer-muted)]">Order #{order.id}</p><h2 className="mt-2 font-bold">{order.branch_name}</h2></div>
                                            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${config.tone}`}><StatusIcon className="h-3.5 w-3.5" /> {config.label}</span>
                                        </div>
                                        <div className="mt-5 space-y-2 text-sm text-[var(--customer-muted)]">
                                            <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(order.created_at).toLocaleString()}</p>
                                            <p className="flex items-center gap-2"><Store className="h-4 w-4" /> {order.items?.length || 0} items · {formatAddress(order.delivery_address)}</p>
                                        </div>
                                        <div className="mt-5 flex items-center justify-between border-t border-[var(--customer-line)] pt-4">
                                            <span className="font-black text-[var(--customer-coral-dark)]">${formatPrice(order.total_amount)}</span>
                                            <button type="button" onClick={() => navigate(`/customer/orders/${order.id}`)} className="flex items-center gap-2 text-sm font-bold text-[var(--customer-ink)] hover:text-[var(--customer-coral-dark)]">View details <ArrowRight className="h-4 w-4" /></button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                        {totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-4 text-sm"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-full border border-[var(--customer-line)] px-4 py-2 font-bold disabled:opacity-40">Previous</button><span className="font-semibold text-[var(--customer-muted)]">Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-full border border-[var(--customer-line)] px-4 py-2 font-bold disabled:opacity-40">Next</button></div>}
                    </>
                )}
            </main>
        </div>
    );
};

export default OrderHistory;
