import React, { useEffect, useState } from 'react';
import { getAllBranches, createBranch, updateBranch } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ManagementAlert, ManagementButton, ManagementCard, ManagementPageHeader } from '../../../components/management/ManagementPrimitives';

const AdminSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({ defaultDeliveryRadius: 10, defaultMinimumOrder: 15 });
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [templateBranch, setTemplateBranch] = useState(null);

    useEffect(() => {
        const loadDefaultSettings = async () => {
            try {
                setLoading(true);
                const response = await getAllBranches();
                const template = response.data.find(branch => branch.name === 'Default Branch Template');
                if (template) {
                    setTemplateBranch(template);
                    setSettings({
                        defaultDeliveryRadius: template.delivery_radius || 10,
                        defaultMinimumOrder: template.minimum_order_amount || 15
                    });
                }
            } catch (err) {
                console.error('Error loading default settings:', err);
                setError('Failed to load settings');
            } finally { setLoading(false); }
        };
        if (user && user.role === 'admin') loadDefaultSettings();
    }, [user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setError(null);
            if (templateBranch) {
                await updateBranch(templateBranch.id, {
                    delivery_radius: settings.defaultDeliveryRadius,
                    minimum_order_amount: settings.defaultMinimumOrder,
                    status: 'inactive'
                });
            } else {
                await createBranch({
                    name: 'Default Branch Template',
                    address: 'Template Address',
                    phone: '000-000-0000',
                    managerName: 'Admin',
                    managerEmail: user.email,
                    managerPassword: Math.random().toString(36).slice(-10),
                    status: 'inactive',
                    delivery_radius: settings.defaultDeliveryRadius,
                    minimum_order_amount: settings.defaultMinimumOrder,
                    latitude: 0,
                    longitude: 0
                });
            }
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.response?.data?.message || 'Failed to update settings');
        }
    };

    return (
        <>
            <ManagementPageHeader eyebrow="Configuration" title="Global system settings" description="Set defaults applied when new branches are created." />
            {error && <ManagementAlert onClose={() => setError(null)}>{error}</ManagementAlert>}
            {showSuccess && <ManagementAlert tone="success">Settings updated successfully.</ManagementAlert>}
            {loading ? <div className="py-16 text-center text-sm text-slate-400">Loading settings...</div> : (
                <div className="max-w-3xl">
                    <ManagementCard className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div><h2 className="text-base font-semibold text-slate-100">Branch default settings</h2><p className="mt-1 text-sm text-slate-500">These values are used as defaults for new branches.</p></div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Default delivery radius (km)</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" type="number" min="1" value={settings.defaultDeliveryRadius} onChange={(e) => setSettings({ ...settings, defaultDeliveryRadius: e.target.value })} /><span className="text-xs text-slate-500">Default delivery radius for new branches.</span></label>
                                <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Default minimum order ($)</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" type="number" min="0" value={settings.defaultMinimumOrder} onChange={(e) => setSettings({ ...settings, defaultMinimumOrder: e.target.value })} /><span className="text-xs text-slate-500">Default minimum order amount.</span></label>
                            </div>
                            <div className="border-t border-[#202832] pt-6"><h2 className="text-base font-semibold text-slate-100">Account information</h2><dl className="mt-4 grid gap-4 sm:grid-cols-3">{[['Username', user.username], ['Email', user.email], ['Role', user.role]].map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-200">{value}</dd></div>)}</dl></div>
                            <div className="flex justify-end border-t border-[#202832] pt-5"><ManagementButton type="submit">Save changes</ManagementButton></div>
                        </form>
                    </ManagementCard>
                </div>
            )}
        </>
    );
};

export default AdminSettings;
