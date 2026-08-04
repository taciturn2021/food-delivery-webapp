import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import MapLocationPicker from '../../../components/common/MapLocationPicker';
import { getBranchSettings, updateBranchSettings, updateBranch } from '../../../services/api';
import { ManagementAlert, ManagementButton, ManagementCard, ManagementPageHeader } from '../../../components/management/ManagementPrimitives';

const initialSettings = { name: '', address: '', phone: '', openingTime: '09:00', closingTime: '22:00', location: null, deliveryRadius: 10, minimumOrderAmount: 15, maxConcurrentOrders: 20, preparationTimeMinutes: 30, allowScheduledOrders: true, maxScheduleDays: 7, automaticOrderAssignment: true, managerEmail: '' };
const fieldLabels = { name: 'Branch name', address: 'Address', phone: 'Phone number', openingTime: 'Opening time', closingTime: 'Closing time', deliveryRadius: 'Delivery radius (km)', minimumOrderAmount: 'Minimum order amount ($)', maxConcurrentOrders: 'Maximum concurrent orders', preparationTimeMinutes: 'Preparation time (minutes)', maxScheduleDays: 'Maximum schedule days' };

const BranchSettings = () => {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(initialSettings);

    useEffect(() => { if (!authLoading && user?.branchId) loadBranchSettings(); }, [user?.branchId, authLoading]);
    const loadBranchSettings = async () => {
        try {
            const response = await getBranchSettings(user.branchId);
            const data = response.data;
            setSettings({
                name: data.name || '', address: data.address || '', phone: data.phone || '',
                openingTime: data.opening_time ? data.opening_time.slice(0, 5) : '09:00', closingTime: data.closing_time ? data.closing_time.slice(0, 5) : '22:00',
                managerEmail: data.manager_email || '', deliveryRadius: data.delivery_radius === null ? 10 : data.delivery_radius,
                minimumOrderAmount: data.minimum_order_amount === null ? 15 : parseFloat(data.minimum_order_amount),
                maxConcurrentOrders: data.max_concurrent_orders === null ? 20 : parseInt(data.max_concurrent_orders),
                preparationTimeMinutes: data.preparation_time_minutes === null ? 30 : parseInt(data.preparation_time_minutes),
                allowScheduledOrders: data.allow_scheduled_orders === null ? true : data.allow_scheduled_orders,
                maxScheduleDays: data.max_schedule_days === null ? 7 : parseInt(data.max_schedule_days),
                automaticOrderAssignment: data.automatic_order_assignment === null ? true : data.automatic_order_assignment,
                location: data.latitude && data.longitude ? { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) } : null
            });
            setError(null);
        } catch (err) { setError('Failed to load branch settings'); } finally { setLoading(false); }
    };
    const handleChange = field => event => setSettings(prev => ({ ...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
    const handleSubmit = async event => {
        event.preventDefault(); setError(null);
        try {
            await updateBranch(user.branchId, { name: settings.name, address: settings.address, phone: settings.phone, latitude: settings.location?.lat, longitude: settings.location?.lng });
            await updateBranchSettings(user.branchId, {
                openingTime: settings.openingTime || '09:00', closingTime: settings.closingTime || '22:00',
                deliveryRadius: settings.deliveryRadius === '' ? null : parseInt(settings.deliveryRadius),
                minimumOrderAmount: settings.minimumOrderAmount === '' ? null : parseFloat(settings.minimumOrderAmount),
                maxConcurrentOrders: settings.maxConcurrentOrders === '' ? null : parseInt(settings.maxConcurrentOrders),
                preparationTimeMinutes: settings.preparationTimeMinutes === '' ? null : parseInt(settings.preparationTimeMinutes),
                allowScheduledOrders: Boolean(settings.allowScheduledOrders), maxScheduleDays: settings.maxScheduleDays === '' ? null : parseInt(settings.maxScheduleDays),
                automaticOrderAssignment: Boolean(settings.automaticOrderAssignment)
            });
            setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) { setError(err.response?.data?.message || 'Failed to update settings'); }
    };

    if (authLoading || (!user?.branchId && loading)) return <div className="py-16 text-center text-sm text-slate-400">Loading user data...</div>;
    if (!user?.branchId) return <ManagementAlert>Unable to load branch settings. Please try logging out and back in.</ManagementAlert>;
    if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading settings...</div>;

    const tabs = ['Basic information', 'Delivery settings', 'Order settings'];
    return (
        <>
            <ManagementPageHeader eyebrow="Configuration" title="Branch settings" description="Manage branch details, delivery rules, and order behavior." />
            {error && <ManagementAlert onClose={() => setError(null)}>{error}</ManagementAlert>}
            {showSuccess && <ManagementAlert tone="success">Settings updated successfully.</ManagementAlert>}
            <ManagementCard className="max-w-5xl p-6">
                <div className="mb-6 flex overflow-x-auto border-b border-[#202832]">{tabs.map((tab, index) => <button type="button" key={tab} onClick={() => setActiveTab(index)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${activeTab === index ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>{tab}</button>)}</div>
                <form onSubmit={handleSubmit}>
                    {activeTab === 0 && <div className="grid gap-5 sm:grid-cols-2"><Field field="name" settings={settings} onChange={handleChange} required className="sm:col-span-2" /><Field field="address" settings={settings} onChange={handleChange} required className="sm:col-span-2" /><Field field="phone" settings={settings} onChange={handleChange} required /><Field field="openingTime" settings={settings} onChange={handleChange} type="time" required /><Field field="closingTime" settings={settings} onChange={handleChange} type="time" required /><ReadOnlyField label="Email (branch manager)" value={settings.managerEmail} hint="This is the branch manager's email address." /><div className="sm:col-span-2"><p className="text-sm font-medium text-slate-300">Branch location</p><p className="mt-1 text-xs text-slate-500">Click on the map to update your branch location.</p><div className="mt-3 h-[400px] overflow-hidden rounded-md"><MapLocationPicker location={settings.location} onLocationChange={location => setSettings({ ...settings, location })} /></div></div></div>}
                    {activeTab === 1 && <div className="grid gap-5 sm:grid-cols-2"><Field field="deliveryRadius" settings={settings} onChange={handleChange} type="number" min="1" required hint="Maximum distance for deliveries." /><Field field="minimumOrderAmount" settings={settings} onChange={handleChange} type="number" min="0" required hint="Minimum order value for delivery." /><Field field="maxConcurrentOrders" settings={settings} onChange={handleChange} type="number" min="1" required hint="Maximum number of orders handled at once." /><Field field="preparationTimeMinutes" settings={settings} onChange={handleChange} type="number" min="5" required hint="Average time to prepare an order." /></div>}
                    {activeTab === 2 && <div className="space-y-6"><Toggle field="allowScheduledOrders" label="Allow scheduled orders" description="Enable customers to schedule orders for future delivery." settings={settings} onChange={handleChange} /><Field field="maxScheduleDays" settings={settings} onChange={handleChange} type="number" min="1" max="30" disabled={!settings.allowScheduledOrders} hint="How many days in advance orders can be scheduled." /><Toggle field="automaticOrderAssignment" label="Automatic order assignment" description="Automatically assign orders to available delivery staff." settings={settings} onChange={handleChange} /></div>}
                    <div className="mt-8 flex justify-end border-t border-[#202832] pt-5"><ManagementButton type="submit">Save changes</ManagementButton></div>
                </form>
            </ManagementCard>
        </>
    );
};

const Field = ({ field, settings, onChange, hint, className = '', ...props }) => <label className={`block space-y-1.5 ${className}`}><span className="text-sm font-medium text-slate-300">{fieldLabels[field]}</span><input className="management-input h-10 w-full rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50" value={settings[field]} onChange={onChange(field)} {...props} />{hint && <span className="text-xs text-slate-500">{hint}</span>}</label>;
const ReadOnlyField = ({ label, value, hint }) => <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-300">{label}</span><input className="management-input h-10 w-full rounded-md px-3 text-sm opacity-70" value={value} readOnly />{hint && <span className="text-xs text-slate-500">{hint}</span>}</label>;
const Toggle = ({ field, label, description, settings, onChange }) => <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-500" checked={settings[field]} onChange={onChange(field)} /><span><span className="block text-sm font-medium text-slate-200">{label}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span></label>;
export default BranchSettings;
