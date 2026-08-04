import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Bike } from 'lucide-react';
import { getBranchRiders, createRider, updateRider } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ManagementAlert, ManagementBadge, ManagementButton, ManagementCard, ManagementPageHeader } from '../../../components/management/ManagementPrimitives';

const emptyForm = { full_name: '', email: '', password: '', cnic: '', contact_number: '', emergency_contact: '', vehicle_type: '', vehicle_plate_no: '', license_no: '', status: 'active' };
const fields = [['full_name', 'Full name'], ['email', 'Email'], ['password', 'Password'], ['cnic', 'CNIC'], ['contact_number', 'Contact number'], ['emergency_contact', 'Emergency contact'], ['vehicle_type', 'Vehicle type'], ['vehicle_plate_no', 'Vehicle plate no'], ['license_no', 'License no']];

const RiderManagement = () => {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const { user } = useAuth();
    const branchId = user.branchId;

    useEffect(() => { loadRiders(); }, [branchId]);
    const loadRiders = async () => {
        try { const response = await getBranchRiders(branchId); setRiders(response.data); }
        catch (err) { setError('Failed to load riders'); }
        finally { setLoading(false); }
    };
    const resetForm = () => { setFormData(emptyForm); setEditingId(null); };
    const handleOpen = (rider = null) => { if (rider) { setFormData({ ...rider, password: '' }); setEditingId(rider.id); } else resetForm(); setOpen(true); };
    const handleSubmit = async event => {
        event.preventDefault();
        try {
            const submitData = { ...formData, branch_id: branchId };
            if (editingId) { const { email, password, ...updateData } = submitData; await updateRider(editingId, updateData); } else await createRider(submitData);
            loadRiders(); resetForm(); setOpen(false);
        } catch (err) { setError(err.response?.data?.message || 'Error saving rider'); }
    };
    const handleStatusToggle = async rider => {
        try {
            const newStatus = rider.status === 'active' ? 'inactive' : 'active';
            await updateRider(rider.user_id, { status: newStatus });
            setRiders(riders.map(item => item.id === rider.id ? { ...item, status: newStatus } : item));
            setSuccessMessage(`Rider ${rider.full_name}'s status changed to ${newStatus}`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) { setError(`Failed to update rider status: ${err.response?.data?.message || err.message}`); }
    };
    if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading delivery staff...</div>;
    return (
        <>
            <ManagementPageHeader eyebrow="People" title="Delivery staff" description="Manage rider accounts and availability for this branch." actions={<ManagementButton onClick={() => handleOpen()}><Plus className="h-4 w-4" /> Add new rider</ManagementButton>} />
            {error && <ManagementAlert onClose={() => setError(null)}>{error}</ManagementAlert>}
            {successMessage && <ManagementAlert tone="success" onClose={() => setSuccessMessage(null)}>{successMessage}</ManagementAlert>}
            <ManagementCard className="overflow-hidden">
                <div className="overflow-x-auto"><table className="management-table w-full min-w-[760px] text-left text-sm"><thead><tr><th className="px-5 py-3">Rider</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Available</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{riders.map(rider => <tr key={rider.id} className="text-slate-300"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300"><Bike className="h-4 w-4" /></span><div><p className="font-medium text-slate-100">{rider.full_name}</p><p className="text-xs text-slate-500">{rider.cnic}</p></div></div></td><td className="px-5 py-4">{rider.contact_number}</td><td className="px-5 py-4">{rider.vehicle_type} <span className="text-slate-500">·</span> {rider.vehicle_plate_no}</td><td className="px-5 py-4"><ManagementBadge tone={rider.status === 'active' ? 'success' : rider.status === 'busy' ? 'warning' : 'neutral'}>{rider.status}</ManagementBadge></td><td className="px-5 py-4"><input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={rider.status === 'active'} disabled={rider.status === 'busy'} onChange={() => handleStatusToggle(rider)} /></td><td className="px-5 py-4 text-right"><ManagementButton variant="ghost" size="sm" onClick={() => handleOpen(rider)}><Edit2 className="h-4 w-4" /></ManagementButton></td></tr>)}</tbody></table></div>
                {riders.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-500">No delivery staff found.</div>}
            </ManagementCard>
            {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true"><div className="management-card max-h-[90vh] w-full max-w-2xl overflow-y-auto"><div className="border-b border-[#202832] px-6 py-4"><h2 className="text-lg font-semibold text-slate-50">{editingId ? 'Edit rider' : 'Add new rider'}</h2></div><form onSubmit={handleSubmit}><div className="grid gap-4 p-6 sm:grid-cols-2">{fields.map(([name, label]) => (!editingId || !['email', 'password'].includes(name)) && <label key={name} className="space-y-1.5"><span className="text-sm font-medium text-slate-300">{label}</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'} value={formData[name] || ''} onChange={e => setFormData({ ...formData, [name]: e.target.value })} required /></label>)}</div><div className="flex justify-end gap-2 border-t border-[#202832] px-6 py-4"><ManagementButton type="button" variant="outline" onClick={() => { resetForm(); setOpen(false); }}>Cancel</ManagementButton><ManagementButton type="submit">{editingId ? 'Save changes' : 'Add rider'}</ManagementButton></div></form></div></div>}
        </>
    );
};
export default RiderManagement;
