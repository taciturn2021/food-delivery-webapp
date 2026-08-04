import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    LayoutDashboard,
    LogOut,
    MoreHorizontal,
    PanelLeft,
    Settings,
    Store,
    UserRound,
    Utensils
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const adminItems = [
    { id: 'menu', label: 'Menu management', icon: Utensils, path: '/admin/menu' },
    { id: 'branches', label: 'Branches', icon: Store, path: '/admin/branches' }
];

const branchItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'menu', label: 'Menu items', icon: Utensils },
    { id: 'riders', label: 'Delivery staff', icon: UserRound }
];

const ManagementShell = ({
    type,
    activeSection,
    onSectionChange,
    children
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [accountOpen, setAccountOpen] = useState(false);
    const isAdmin = type === 'admin';
    const items = isAdmin ? adminItems : branchItems;
    const activeId = isAdmin
        ? location.pathname.split('/')[2] || 'menu'
        : activeSection;
    const title = isAdmin ? 'Admin workspace' : user?.branchName || 'Branch workspace';

    const selectItem = (item) => {
        if (isAdmin) navigate(item.path);
        else onSectionChange(item.id);
        setAccountOpen(false);
    };

    const selectSettings = () => {
        if (isAdmin) navigate('/admin/settings');
        else onSectionChange('settings');
        setAccountOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="management-page flex min-h-screen">
            <aside className={cn(
                'management-sidebar fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-200',
                sidebarOpen ? 'w-64' : 'w-[4.5rem]'
            )}>
                <div className="flex h-16 items-center border-b border-[#202832] px-4">
                    <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex min-w-0 items-center gap-3 text-left">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-500 text-sm font-bold text-white">FD</span>
                        {sidebarOpen && <span className="truncate text-sm font-semibold text-slate-100">Food Delivery</span>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    <p className={cn('mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-600', !sidebarOpen && 'sr-only')}>
                        Workspace
                    </p>
                    <nav className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const active = activeId === item.id;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => selectItem(item)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition',
                                        active ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                                        !sidebarOpen && 'justify-center px-0'
                                    )}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="my-4 border-t border-[#202832]" />
                    <button
                        type="button"
                        onClick={selectSettings}
                        className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition',
                            activeId === 'settings' ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                            !sidebarOpen && 'justify-center px-0'
                        )}
                        title={!sidebarOpen ? 'Settings' : undefined}
                    >
                        <Settings className="h-4 w-4 shrink-0" />
                        {sidebarOpen && <span>Settings</span>}
                    </button>
                </div>

                <div className="border-t border-[#202832] p-3">
                    <div className={cn('flex items-center gap-3 rounded-md p-2', !sidebarOpen && 'justify-center')}>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                        {sidebarOpen && (
                            <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-slate-200">{user?.username || 'User'}</p>
                                <p className="truncate text-[0.68rem] text-slate-500">{isAdmin ? 'Administrator' : 'Branch manager'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <div className={cn('min-w-0 flex-1 transition-[margin] duration-200', sidebarOpen ? 'ml-64' : 'ml-[4.5rem]')}>
                <header className="management-topbar sticky top-0 z-30 flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100" aria-label="Toggle sidebar">
                            <PanelLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <p className="text-sm font-semibold text-slate-100">{title}</p>
                            <p className="text-xs text-slate-500">{isAdmin ? 'System administration' : 'Branch operations'}</p>
                        </div>
                    </div>
                    <div className="relative">
                        <button type="button" onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800" aria-expanded={accountOpen}>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                            <span className="hidden max-w-32 truncate sm:block">{user?.username}</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </button>
                        {accountOpen && (
                            <div className="management-card absolute right-0 top-11 w-48 p-1 shadow-2xl">
                                <button type="button" onClick={selectSettings} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800"><Settings className="h-4 w-4" /> Settings</button>
                                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Logout</button>
                            </div>
                        )}
                    </div>
                </header>
                <main className="p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
};

export default ManagementShell;
