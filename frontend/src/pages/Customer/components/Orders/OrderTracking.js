import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bike, Check, Clock3, Home, Loader2, MapPin, MessageCircle, Store, Utensils, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { cancelOrder, getOrderById } from '../../../../services/api';
import { useToast } from '../../../../components/ui/use-toast';
import CustomerHeader from '../../../../components/customer/CustomerHeader';
import { CustomerError, CustomerLoading } from '../../../../components/customer/CustomerStates';

const statuses = [
    { key: 'pending', label: 'Order received', detail: 'Waiting for the kitchen to confirm.', icon: Clock3 },
    { key: 'preparing', label: 'Being prepared', detail: 'The kitchen is making your order.', icon: Utensils },
    { key: 'delivering', label: 'On the way', detail: 'Your order is heading to you.', icon: Bike },
    { key: 'delivered', label: 'Delivered', detail: 'Enjoy your meal.', icon: Check }
];

const formatPrice = (price) => {
    const numericPrice = Number.parseFloat(price);
    return Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : '0.00';
};

const parseAddress = (address) => {
    if (!address) return {};
    if (typeof address !== 'string') return address;
    try {
        return JSON.parse(address);
    } catch {
        return { street: address };
    }
};

const markerIcon = (emoji, color) => L.divIcon({
    className: '',
    html: `<div style="align-items:center;background:${color};border:3px solid white;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.2);display:flex;font-size:15px;height:34px;justify-content:center;width:34px">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
});

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await getOrderById(id);
            setOrder(response.data);
            setError('');
        } catch (fetchError) {
            console.error('Error fetching order:', fetchError);
            setError('We could not load this order.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrder();
        const interval = window.setInterval(fetchOrder, 30000);
        return () => window.clearInterval(interval);
    }, [fetchOrder]);

    const address = useMemo(() => parseAddress(order?.delivery_address), [order?.delivery_address]);
    const currentIndex = statuses.findIndex((status) => status.key === order?.status);
    const canCancel = order && ['pending', 'preparing'].includes(order.status);

    const handleCancel = async () => {
        if (!window.confirm('Cancel this order? This cannot be undone.')) return;
        try {
            setCancelling(true);
            await cancelOrder(id);
            await fetchOrder();
            toast({ title: 'Order cancelled', description: 'The order has been cancelled.', variant: 'success' });
        } catch (cancelError) {
            toast({ title: 'Could not cancel order', description: cancelError.response?.data?.message || 'Please try again.', variant: 'destructive' });
        } finally {
            setCancelling(false);
        }
    };

    const customerPosition = address.latitude && address.longitude ? [Number(address.latitude), Number(address.longitude)] : null;
    const branchPosition = order?.branch_latitude && order?.branch_longitude ? [Number(order.branch_latitude), Number(order.branch_longitude)] : null;
    const riderPosition = order?.rider_latitude && order?.rider_longitude ? [Number(order.rider_latitude), Number(order.rider_longitude)] : null;
    const mapCenter = customerPosition || branchPosition || riderPosition;

    return (
        <div className="customer-page pb-20 md:pb-0">
            <CustomerHeader />
            <main className="customer-container pt-[7.5rem]">
                <div className="mb-7 flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/customer/orders')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--customer-line)] transition hover:border-[var(--customer-coral)]"><ArrowLeft className="h-4 w-4" /></button>
                    <div><p className="customer-eyebrow">Live order</p><h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Order #{id}</h1></div>
                    {order && <span className="ml-auto rounded-full bg-[var(--customer-sage-soft)] px-3 py-1.5 text-xs font-bold text-[var(--customer-sage)]">{order.status}</span>}
                </div>

                {loading ? <CustomerLoading label="Finding your order..." /> : error ? <CustomerError message={error} onRetry={fetchOrder} /> : order && (
                    <>
                        <section className="customer-surface mb-6 overflow-hidden p-5 sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div><p className="customer-eyebrow">From the kitchen</p><h2 className="mt-1 text-2xl font-black">{order.branch_name}</h2><p className="mt-2 text-sm text-[var(--customer-muted)]">We will keep this page updated as your order moves.</p></div>
                                <div className="rounded-2xl bg-[var(--customer-soft)] px-4 py-3 text-right"><p className="text-xs text-[var(--customer-muted)]">Order total</p><p className="mt-1 text-xl font-black text-[var(--customer-coral-dark)]">${formatPrice(order.total_amount)}</p></div>
                            </div>
                            {order.status === 'cancelled' ? (
                                <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[var(--customer-danger-soft)] p-4 text-[var(--customer-coral-dark)]"><X className="h-5 w-5" /><span className="text-sm font-semibold">This order was cancelled.</span></div>
                            ) : (
                                <div className="mt-8 grid gap-5 sm:grid-cols-4">
                                    {statuses.map((status, index) => {
                                        const Icon = status.icon;
                                        const completed = currentIndex >= index || order.status === 'delivered';
                                        const current = order.status === status.key;
                                        return (
                                            <div key={status.key} className="relative">
                                                {index < statuses.length - 1 && <span className={`absolute left-9 right-[-1rem] top-5 hidden h-0.5 sm:block ${completed && currentIndex > index ? 'bg-[var(--customer-coral)]' : 'bg-[var(--customer-line)]'}`} />}
                                                <div className="relative flex items-center gap-3 sm:block">
                                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${completed ? 'bg-[var(--customer-coral)] text-white' : 'bg-[var(--customer-soft)] text-[var(--customer-muted)]'}`}><Icon className="h-4 w-4" /></span>
                                                    <span className="sm:mt-3 sm:block"><span className={`block text-sm font-bold ${current ? 'text-[var(--customer-coral-dark)]' : ''}`}>{status.label}</span><span className="mt-1 block text-xs leading-5 text-[var(--customer-muted)]">{current ? status.detail : completed ? 'Done' : 'Coming up'}</span></span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                            <section className="customer-surface p-5 sm:p-7">
                                <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Your order</h2><span className="text-sm text-[var(--customer-muted)]">{order.items?.length || 0} items</span></div>
                                <div className="divide-y divide-[var(--customer-line)]">
                                    {(order.items || []).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-4 first:pt-0"><div><p className="font-bold">{item.name}</p><p className="mt-1 text-sm text-[var(--customer-muted)]">${formatPrice(item.price_at_time)} × {item.quantity}</p>{item.special_instructions && <p className="mt-1 text-xs text-[var(--customer-muted)]">Note: {item.special_instructions}</p>}</div><p className="font-bold">${formatPrice(Number(item.price_at_time) * item.quantity)}</p></div>)}
                                </div>
                                <div className="mt-4 flex justify-between border-t border-[var(--customer-line)] pt-4 font-black"><span>Total</span><span className="text-[var(--customer-coral-dark)]">${formatPrice(order.total_amount)}</span></div>
                            </section>

                            <div className="space-y-6">
                                <section className="customer-surface overflow-hidden">
                                    <div className="flex items-center justify-between p-5 sm:p-7 pb-3"><div><p className="customer-eyebrow">Delivery</p><h2 className="mt-1 text-xl font-bold">Follow the handoff</h2></div><MapPin className="h-5 w-5 text-[var(--customer-coral)]" /></div>
                                    <div className="h-64 bg-[var(--customer-soft)]">
                                        {mapCenter ? (
                                            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                                                {customerPosition && <Marker position={customerPosition} icon={markerIcon('⌂', '#E76543')}><Popup>Delivery address</Popup></Marker>}
                                                {branchPosition && <Marker position={branchPosition} icon={markerIcon('✦', '#6F8972')}><Popup>{order.branch_name}</Popup></Marker>}
                                                {riderPosition && order.status !== 'delivered' && <Marker position={riderPosition} icon={markerIcon('●', '#D9A441')}><Popup>Rider location</Popup></Marker>}
                                            </MapContainer>
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-[var(--customer-muted)]"><MapPin className="h-6 w-6" /><p>Location updates are not available yet.</p></div>
                                        )}
                                    </div>
                                </section>
                                <section className="customer-surface p-5 sm:p-7">
                                    <p className="customer-eyebrow">At a glance</p>
                                    <div className="mt-4 space-y-4 text-sm">
                                        <p className="flex items-start gap-3"><Home className="mt-0.5 h-4 w-4 shrink-0 text-[var(--customer-coral)]" /><span><span className="block font-bold">Delivering to</span><span className="mt-1 block text-[var(--customer-muted)]">{address.street || 'Saved address'}{address.city ? `, ${address.city}` : ''}</span></span></p>
                                        <p className="flex items-start gap-3"><Store className="mt-0.5 h-4 w-4 shrink-0 text-[var(--customer-coral)]" /><span><span className="block font-bold">Restaurant</span><span className="mt-1 block text-[var(--customer-muted)]">{order.branch_name}</span></span></p>
                                        {order.rider_first_name && <p className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--customer-coral)]" /><span><span className="block font-bold">Your rider</span><span className="mt-1 block text-[var(--customer-muted)]">{order.rider_first_name} {order.rider_last_name}</span></span></p>}
                                    </div>
                                    {canCancel && <button type="button" onClick={handleCancel} disabled={cancelling} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--customer-coral)] text-sm font-bold text-[var(--customer-coral-dark)] transition hover:bg-[var(--customer-danger-soft)] disabled:opacity-50">{cancelling && <Loader2 className="h-4 w-4 animate-spin" />} Cancel order</button>}
                                </section>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default OrderTracking;
