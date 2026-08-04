import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Store, Utensils } from 'lucide-react';

const items = [{ path: '/admin/menu', label: 'Menu management', icon: Utensils }, { path: '/admin/branches', label: 'Branches', icon: Store }, { path: '/admin/settings', label: 'Settings', icon: Settings }];

const AdminSidebar = ({ open = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    return <aside className={`management-sidebar fixed inset-y-0 left-0 z-20 flex flex-col ${open ? 'w-64' : 'w-[4.5rem]'}`}><div className="flex h-16 items-center border-b border-[#202832] px-4"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500 text-xs font-bold text-white">FD</span>{open && <span className="ml-3 text-sm font-semibold text-slate-100">Food Delivery</span>}</div><nav className="space-y-1 p-3">{items.map(item => { const Icon = item.icon; return <button type="button" key={item.path} onClick={() => navigate(item.path)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${location.pathname === item.path ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'} ${!open && 'justify-center px-0'}`} title={!open ? item.label : undefined}><Icon className="h-4 w-4" />{open && item.label}</button>; })}</nav></aside>;
};
export default AdminSidebar;
