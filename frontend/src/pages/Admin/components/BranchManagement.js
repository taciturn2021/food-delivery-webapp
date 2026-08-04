import React, { useEffect, useState } from 'react';
import { Edit2, MapPin, Plus, Trash2 } from 'lucide-react';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../../../services/api';
import MapLocationPicker from '../../../components/common/MapLocationPicker';
import { ManagementAlert, ManagementBadge, ManagementButton, ManagementCard, ManagementPageHeader } from '../../../components/management/ManagementPrimitives';

const emptyForm = { name: '', address: '', phone: '', status: 'active', managerName: '', managerEmail: '', managerPassword: '', openingTime: '09:00', closingTime: '22:00', location: null };

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => { loadBranches(); }, []);
    const loadBranches = async () => {
        try { const response = await getAllBranches(); setBranches(response.data); }
        catch (err) { setError('Failed to load branches'); }
        finally { setLoading(false); }
    };
    const resetForm = () => { setFormData(emptyForm); setEditingId(null); setActiveTab(0); };
    const handleOpen = (branch = null) => {
        if (branch) {
            setFormData({
                name: branch.name || '', address: branch.address || '', phone: branch.phone || '', status: branch.status || 'active',
                location: branch.latitude && branch.longitude ? { lat: parseFloat(branch.latitude), lng: parseFloat(branch.longitude) } : null,
                managerName: branch.manager_name || '', managerEmail: branch.manager_email || '', managerPassword: '',
                openingTime: branch.opening_time?.slice(0, 5) || '09:00', closingTime: branch.closing_time?.slice(0, 5) || '22:00'
            });
            setEditingId(branch.id);
        } else resetForm();
        setOpen(true);
    };
    const handleClose = () => { resetForm(); setOpen(false); };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!editingId && (!formData.managerName || !formData.managerEmail || !formData.managerPassword)) {
            setError('Branch manager details are required when creating a new branch');
            setActiveTab(1);
            return;
        }
        try {
            if (editingId) {
                const updateData = {
                    name: formData.name, address: formData.address, phone: formData.phone, status: formData.status,
                    latitude: formData.location?.lat, longitude: formData.location?.lng,
                    manager_name: formData.managerName, manager_email: formData.managerEmail
                };
                if (formData.managerPassword?.trim()) updateData.manager_password = formData.managerPassword;
                await updateBranch(editingId, updateData);
            } else {
                await createBranch({ ...formData, latitude: formData.location?.lat, longitude: formData.location?.lng });
            }
            await loadBranches();
            handleClose();
        } catch (err) { setError(err.response?.data?.message || 'Error saving branch'); }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try { await deleteBranch(id); loadBranches(); } catch (err) { setError('Failed to delete branch'); }
    };

    if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading branches...</div>;
    return (
        <>
            <ManagementPageHeader eyebrow="Locations" title="Branch management" description="Manage locations, operating details, and branch manager accounts." actions={<ManagementButton onClick={() => handleOpen()}><Plus className="h-4 w-4" /> Add new branch</ManagementButton>} />
            {error && <ManagementAlert onClose={() => setError(null)}>{error}</ManagementAlert>}
            <ManagementCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="management-table w-full min-w-[760px] text-left text-sm">
                        <thead><tr><th className="px-5 py-3">Branch</th><th className="px-5 py-3">Address</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                        <tbody>{branches.map(branch => <tr key={branch.id} className="text-slate-300">
                            <td className="px-5 py-4"><p className="font-medium text-slate-100">{branch.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {branch.manager_name || 'No manager assigned'}</p></td>
                            <td className="max-w-xs truncate px-5 py-4 text-slate-400">{branch.address}</td><td className="px-5 py-4">{branch.phone}</td>
                            <td className="px-5 py-4"><ManagementBadge tone={branch.status === 'active' ? 'success' : 'neutral'}>{branch.status}</ManagementBadge></td>
                            <td className="px-5 py-4"><div className="flex justify-end gap-1"><ManagementButton variant="ghost" size="sm" onClick={() => handleOpen(branch)} aria-label={`Edit ${branch.name}`}><Edit2 className="h-4 w-4" /></ManagementButton><ManagementButton variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(branch.id)} aria-label={`Delete ${branch.name}`}><Trash2 className="h-4 w-4" /></ManagementButton></div></td>
                        </tr>)}</tbody>
                    </table>
                </div>
                {branches.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-500">No branches found.</div>}
            </ManagementCard>
            {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
                <div className="management-card max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-2xl">
                    <div className="border-b border-[#202832] px-6 py-4"><h2 className="text-lg font-semibold text-slate-50">{editingId ? 'Edit branch' : 'Add new branch'}</h2></div>
                    <div className="flex border-b border-[#202832] px-6"><button type="button" onClick={() => setActiveTab(0)} className={`border-b-2 px-4 py-3 text-sm ${activeTab === 0 ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-500'}`}>Branch info</button><button type="button" onClick={() => setActiveTab(1)} className={`border-b-2 px-4 py-3 text-sm ${activeTab === 1 ? 'border-indigo-400 text-indigo-300' : 'border-transparent text-slate-500'}`}>Manager account</button></div>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5 p-6">
                            {activeTab === 0 ? <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Branch name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} required />
                                <Field label="Phone number" value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} required />
                                <Field label="Address" className="sm:col-span-2" value={formData.address} onChange={v => setFormData({ ...formData, address: v })} required />
                                <Field label="Opening time" type="time" value={formData.openingTime} onChange={v => setFormData({ ...formData, openingTime: v })} required />
                                <Field label="Closing time" type="time" value={formData.closingTime} onChange={v => setFormData({ ...formData, closingTime: v })} required />
                                <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Status</span><select className="management-input h-10 w-full rounded-md px-3 text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                                <div className="sm:col-span-2"><p className="mb-2 text-sm font-medium text-slate-300">Branch location <span className="text-slate-500">(click map to set)</span></p><div className="overflow-hidden rounded-md"><MapLocationPicker location={formData.location} onLocationChange={location => setFormData({ ...formData, location })} /></div></div>
                            </div> : <div className="grid gap-4">
                                <Field label="Manager name" value={formData.managerName} onChange={v => setFormData({ ...formData, managerName: v })} required={!editingId} />
                                <Field label="Manager email" type="email" value={formData.managerEmail} onChange={v => setFormData({ ...formData, managerEmail: v })} required={!editingId} />
                                <Field label="Manager password" type="password" value={formData.managerPassword} onChange={v => setFormData({ ...formData, managerPassword: v })} required={!editingId} hint={editingId ? 'Leave blank to keep current password.' : 'Enter a password for the new manager.'} />
                            </div>}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-[#202832] px-6 py-4"><ManagementButton type="button" variant="outline" onClick={handleClose}>Cancel</ManagementButton><ManagementButton type="submit" disabled={!formData.location}>{editingId ? 'Save changes' : 'Create branch'}</ManagementButton></div>
                    </form>
                </div>
            </div>}
        </>
    );
};

const Field = ({ label, value, onChange, hint, className = '', ...props }) => <label className={`block space-y-1.5 ${className}`}><span className="text-sm font-medium text-slate-300">{label}</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" value={value} onChange={e => onChange(e.target.value)} {...props} />{hint && <span className="text-xs text-slate-500">{hint}</span>}</label>;
export default BranchManagement;
