import React, { useState } from 'react';
import { MoreHorizontal, PanelLeft, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminHeader = ({ onSidebarToggle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    return <header className="management-topbar fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between px-6"><div className="flex items-center gap-3"><button type="button" onClick={onSidebarToggle} className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"><PanelLeft className="h-4 w-4" /></button><div><p className="text-sm font-semibold text-slate-100">Admin workspace</p><p className="text-xs text-slate-500">System administration</p></div></div><div className="relative"><button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-md p-1.5 text-slate-300 hover:bg-slate-800"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs text-indigo-300">{user?.username?.[0]?.toUpperCase() || 'U'}</span><MoreHorizontal className="h-4 w-4" /></button>{open && <div className="management-card absolute right-0 top-11 w-44 p-1"><button type="button" onClick={() => navigate('/admin/settings')} className="flex w-full gap-2 rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"><Settings className="h-4 w-4" /> Settings</button><button type="button" onClick={() => { logout(); navigate('/login'); }} className="flex w-full gap-2 rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Logout</button></div>}</div></header>;
};
export default AdminHeader;
