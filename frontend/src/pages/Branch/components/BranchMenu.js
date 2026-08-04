import React, { useEffect, useState } from 'react';
import { CheckCircle2, Edit2, Filter, Search, XCircle } from 'lucide-react';
import { getBranchMenu, assignMenuItemToBranch } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ManagementAlert, ManagementBadge, ManagementButton, ManagementCard, ManagementPageHeader } from '../../../components/management/ManagementPrimitives';

const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides', 'Special Offers'];

const BranchMenu = () => {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [editItem, setEditItem] = useState(null);

    useEffect(() => { loadBranchMenu(); }, []);
    const loadBranchMenu = async () => {
        try { const response = await getBranchMenu(user.branchId); setMenuItems(response.data); }
        catch (err) { setError('Failed to load menu items'); }
        finally { setLoading(false); }
    };
    const handleEditOpen = (item) => setEditItem({ ...item, branch_price: item.branch_price || item.price, branch_availability: item.branch_availability !== undefined ? item.branch_availability : item.is_available });
    const saveItem = async () => {
        try {
            await assignMenuItemToBranch({ branch_id: user.branchId, menu_item_id: editItem.id, price: editItem.branch_price, is_available: editItem.branch_availability });
            setSuccess('Menu item updated successfully'); await loadBranchMenu(); setEditItem(null);
        } catch (err) { setError('Failed to update menu item'); }
    };
    const handleAvailabilityChange = async (itemId, value) => {
        try {
            const item = menuItems.find(menuItem => menuItem.id === itemId);
            await assignMenuItemToBranch({ branch_id: user.branchId, menu_item_id: itemId, is_available: value, price: item.branch_price || item.price });
            loadBranchMenu();
        } catch (err) { setError('Failed to update item availability'); }
    };
    const filteredItems = menuItems.filter(item => (selectedCategory === 'All' || item.category === selectedCategory) && `${item.name} ${item.description}`.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading menu items...</div>;
    return (
        <>
            <ManagementPageHeader eyebrow="Branch operations" title="Branch menu" description="Control local pricing and availability for this branch." />
            {error && <ManagementAlert onClose={() => setError(null)}>{error}</ManagementAlert>}
            {success && <ManagementAlert tone="success" onClose={() => setSuccess('')}>{success}</ManagementAlert>}
            <ManagementCard className="mb-4 p-4"><div className="flex flex-wrap gap-3"><div className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" /><input className="management-input h-9 w-full rounded-md pl-9 pr-3 text-sm" placeholder="Search menu items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div><div className="flex items-center gap-2"><Filter className="h-4 w-4 text-slate-500" /><select className="management-input h-9 rounded-md px-3 text-sm" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>{categories.map(category => <option key={category}>{category}</option>)}</select></div></div></ManagementCard>
            <div className="grid gap-4 xl:grid-cols-2">{filteredItems.map(item => {
                const available = item.branch_availability !== undefined ? item.branch_availability : item.is_available;
                return <ManagementCard key={item.id} className="overflow-hidden"><div className="flex gap-4 p-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-800">{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-600">No image</div>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="font-medium text-slate-100">{item.name}</h2><p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p></div><ManagementButton variant="ghost" size="sm" onClick={() => handleEditOpen(item)}><Edit2 className="h-4 w-4" /></ManagementButton></div><div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="font-semibold text-indigo-300">${Number(item.branch_price || item.price).toFixed(2)}</span><ManagementBadge>{item.category}</ManagementBadge></div><label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400"><input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={available} onChange={e => handleAvailabilityChange(item.id, e.target.checked)} />{available ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Available</> : <><XCircle className="h-3.5 w-3.5 text-red-400" /> Unavailable</>}</label></div></div></div></ManagementCard>;
            })}</div>
            {filteredItems.length === 0 && <ManagementCard className="p-12 text-center text-sm text-slate-500">No matching menu items found.</ManagementCard>}
            {editItem && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true"><div className="management-card w-full max-w-md"><div className="border-b border-[#202832] px-6 py-4"><h2 className="text-lg font-semibold text-slate-50">Edit menu item</h2><p className="mt-1 text-sm text-slate-500">{editItem.name}</p></div><div className="space-y-5 p-6"><label className="block space-y-1.5"><span className="text-sm font-medium text-slate-300">Branch price</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" type="number" step="0.01" value={editItem.branch_price} onChange={e => setEditItem({ ...editItem, branch_price: e.target.value })} /></label><label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={editItem.branch_availability} onChange={e => setEditItem({ ...editItem, branch_availability: e.target.checked })} /> Available at this branch</label></div><div className="flex justify-end gap-2 border-t border-[#202832] px-6 py-4"><ManagementButton variant="outline" onClick={() => setEditItem(null)}>Cancel</ManagementButton><ManagementButton onClick={saveItem}>Save changes</ManagementButton></div></div></div>}
        </>
    );
};
export default BranchMenu;
