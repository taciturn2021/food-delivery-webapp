import React from 'react';
import { ClipboardList, LayoutDashboard, Settings, UserRound, Utensils } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const items = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'orders', label: 'Orders', icon: ClipboardList }, { id: 'menu', label: 'Menu items', icon: Utensils }, { id: 'riders', label: 'Delivery staff', icon: UserRound }, { id: 'settings', label: 'Settings', icon: Settings }];

const BranchSidebar = ({ open = true, selectedSection, onSectionChange }) => {
    const { user } = useAuth();
    return <aside className={`management-sidebar fixed inset-y-0 left-0 z-20 flex flex-col ${open ? 'w-64' : 'w-[4.5rem]'}`}><div className="flex h-16 items-center border-b border-[#202832] px-4"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500 text-xs font-bold text-white">FD</span>{open && <span className="ml-3 truncate text-sm font-semibold text-slate-100">{user?.branchName || 'Branch workspace'}</span>}</div><nav className="space-y-1 p-3">{items.map(item => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => onSectionChange(item.id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm ${selectedSection === item.id ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'} ${!open && 'justify-center px-0'}`} title={!open ? item.label : undefined}><Icon className="h-4 w-4" />{open && item.label}</button>; })}</nav></aside>;
};
export default BranchSidebar;
