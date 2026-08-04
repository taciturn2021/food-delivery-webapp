import React, { useEffect, useState } from 'react';
import { Edit2, ImageOff, Plus, Trash2 } from 'lucide-react';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuItemImage } from '../../../services/api';
import {
    ManagementAlert,
    ManagementBadge,
    ManagementButton,
    ManagementCard,
    ManagementPageHeader
} from '../../../components/management/ManagementPrimitives';

const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides', 'Special Offers'];
const emptyForm = { name: '', description: '', price: '', category: '', image_url: '', image_file: null, is_available: true };

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { loadMenuItems(); }, []);

    const loadMenuItems = async () => {
        try {
            const response = await getAllMenuItems({ cacheBust: Date.now() });
            setMenuItems(response.data);
        } catch (err) {
            setError('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
    };

    const handleOpen = (item = null) => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                price: item.price || '',
                category: item.category || '',
                image_url: item.image_url || '',
                image_file: null,
                is_available: item.is_available
            });
            setEditingId(item.id);
        } else resetForm();
        setOpen(true);
    };

    const handleClose = () => { resetForm(); setOpen(false); };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const { image_file, ...menuItemData } = formData;
            let response;
            if (editingId) {
                response = await updateMenuItem(editingId, menuItemData);
                setSuccess('Menu item updated successfully');
            } else {
                response = await createMenuItem(menuItemData);
                setSuccess('Menu item created successfully');
            }
            const menuItemId = editingId || response.data.id;
            if (image_file) {
                await uploadMenuItemImage(menuItemId, image_file);
                setSuccess('Menu item and image saved successfully');
            }
            await loadMenuItems({ cacheBust: Date.now() });
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving menu item');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteMenuItem(id);
            setSuccess('Menu item deleted successfully');
            loadMenuItems({ cacheBust: Date.now() });
        } catch (err) {
            setError('Failed to delete menu item');
        }
    };

    if (loading) return <div className="py-16 text-center text-sm text-slate-400">Loading menu items...</div>;

    return (
        <>
            <ManagementPageHeader
                eyebrow="Inventory"
                title="Menu management"
                description="Keep the global menu catalog accurate and ready for branches."
                actions={<ManagementButton onClick={() => handleOpen()}><Plus className="h-4 w-4" /> Add new item</ManagementButton>}
            />
            {error && <ManagementAlert onClose={() => setError(null)}>{error}</ManagementAlert>}
            {success && <ManagementAlert tone="success" onClose={() => setSuccess('')}>{success}</ManagementAlert>}

            <ManagementCard className="overflow-hidden">
                <div className="border-b border-[#202832] px-5 py-4">
                    <p className="text-sm font-medium text-slate-200">{menuItems.length} catalog items</p>
                    <p className="mt-1 text-xs text-slate-500">Changes here are available to branch managers.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="management-table w-full min-w-[760px] text-left text-sm">
                        <thead><tr>
                            <th className="px-5 py-3">Item</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Price</th>
                            <th className="px-5 py-3">Availability</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {menuItems.map((item) => (
                                <tr key={item.id} className="text-slate-300">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.image_url ? <img src={item.image_url} alt="" className="h-10 w-10 rounded-md object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 text-slate-500"><ImageOff className="h-4 w-4" /></span>}
                                            <div><p className="font-medium text-slate-100">{item.name}</p><p className="mt-0.5 max-w-md truncate text-xs text-slate-500">{item.description}</p></div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><ManagementBadge>{item.category}</ManagementBadge></td>
                                    <td className="px-5 py-4 font-medium text-slate-100">${Number(item.price).toFixed(2)}</td>
                                    <td className="px-5 py-4"><ManagementBadge tone={item.is_available ? 'success' : 'danger'}>{item.is_available ? 'Available' : 'Unavailable'}</ManagementBadge></td>
                                    <td className="px-5 py-4"><div className="flex justify-end gap-1">
                                        <ManagementButton variant="ghost" size="sm" onClick={() => handleOpen(item)} aria-label={`Edit ${item.name}`}><Edit2 className="h-4 w-4" /></ManagementButton>
                                        <ManagementButton variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(item.id)} aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></ManagementButton>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {menuItems.length === 0 && <div className="px-5 py-12 text-center text-sm text-slate-500">No menu items found.</div>}
            </ManagementCard>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
                    <div className="management-card w-full max-w-xl shadow-2xl">
                        <div className="border-b border-[#202832] px-6 py-4"><h2 className="text-lg font-semibold text-slate-50">{editingId ? 'Edit menu item' : 'Add new menu item'}</h2><p className="mt-1 text-sm text-slate-500">Use the same catalog fields used by the existing workflow.</p></div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 p-6 sm:grid-cols-2">
                                <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Item name</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></label>
                                <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Description</span><textarea className="management-input min-h-24 w-full rounded-md px-3 py-2 text-sm" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></label>
                                <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Price</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></label>
                                <label className="space-y-1.5"><span className="text-sm font-medium text-slate-300">Category</span><select className="management-input h-10 w-full rounded-md px-3 text-sm" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required><option value="">Select category</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
                                <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">Upload image</span><input className="management-input w-full rounded-md px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-500/20 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-200" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFormData({ ...formData, image_file: e.target.files?.[0] || null })} /><span className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF up to 5 MB. {formData.image_file ? `Selected: ${formData.image_file.name}` : ''}</span></label>
                                <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-medium text-slate-300">External image URL (optional)</span><input className="management-input h-10 w-full rounded-md px-3 text-sm" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} /><span className="text-xs text-slate-500">Used only when no uploaded image exists.</span></label>
                                <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} /> Available for order</label>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-[#202832] px-6 py-4"><ManagementButton type="button" variant="outline" onClick={handleClose}>Cancel</ManagementButton><ManagementButton type="submit">{editingId ? 'Update item' : 'Create item'}</ManagementButton></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default MenuManagement;
