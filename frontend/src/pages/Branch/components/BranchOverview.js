import React from 'react';
import { ClipboardList, Clock3, DollarSign, Bike, Utensils } from 'lucide-react';
import { ManagementButton, ManagementCard, ManagementPageHeader, ManagementStat } from '../../../components/management/ManagementPrimitives';

const BranchOverview = ({ orders = [], onSectionChange }) => {
    const todayOrders = orders.filter(order => new Date(order.created_at).toDateString() === new Date().toDateString());
    const stats = todayOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        if (order.status !== 'cancelled') acc.totalRevenue += parseFloat(order.total || 0);
        return acc;
    }, { pending: 0, preparing: 0, delivering: 0, totalRevenue: 0 });
    const active = stats.pending + stats.preparing + stats.delivering;
    const statuses = [
        ['Orders pending', stats.pending, 'amber'],
        ['Orders preparing', stats.preparing, 'sky'],
        ['Orders delivering', stats.delivering, 'emerald']
    ];

    return (
        <>
            <ManagementPageHeader eyebrow="Operations" title="Branch overview" description="A live snapshot of today's order activity." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ManagementStat label="Active orders" value={active} detail={`${stats.pending} pending approval`} icon={<ClipboardList className="h-4 w-4" />} />
                <ManagementStat label="Orders preparing" value={stats.preparing} detail="In kitchen" icon={<Clock3 className="h-4 w-4" />} tone="sky" />
                <ManagementStat label="Today's revenue" value={`$${stats.totalRevenue.toFixed(2)}`} detail="From all orders" icon={<DollarSign className="h-4 w-4" />} tone="amber" />
                <ManagementStat label="Active deliveries" value={stats.delivering} detail="In transit" icon={<Bike className="h-4 w-4" />} tone="emerald" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <ManagementCard className="p-5">
                    <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-slate-100">Order status overview</h2><p className="mt-1 text-xs text-slate-500">Current workload by stage.</p></div><ManagementButton variant="outline" size="sm" onClick={() => onSectionChange('orders')}>View all orders</ManagementButton></div>
                    <div className="mt-6 space-y-5">{statuses.map(([label, value, tone]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">{label}</span><span className="font-medium text-slate-200">{value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${tone === 'amber' ? 'bg-amber-400' : tone === 'sky' ? 'bg-sky-400' : 'bg-emerald-400'}`} style={{ width: `${value > 0 ? (value / Math.max(active, 1)) * 100 : 0}%` }} /></div></div>)}</div>
                </ManagementCard>
                <ManagementCard className="p-5"><h2 className="text-sm font-semibold text-slate-100">Quick actions</h2><p className="mt-1 text-xs text-slate-500">Jump to the operational tools you use most.</p><div className="mt-5 grid gap-2"><ManagementButton onClick={() => onSectionChange('orders')} className="justify-start"><ClipboardList className="h-4 w-4" /> Manage orders</ManagementButton><ManagementButton variant="outline" onClick={() => onSectionChange('menu')} className="justify-start"><Utensils className="h-4 w-4" /> Update menu</ManagementButton><ManagementButton variant="outline" onClick={() => onSectionChange('riders')} className="justify-start"><Bike className="h-4 w-4" /> Manage delivery staff</ManagementButton></div></ManagementCard>
            </div>
        </>
    );
};
export default BranchOverview;
