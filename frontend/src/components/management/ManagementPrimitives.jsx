import React from 'react';
import { cn } from '../../lib/utils';

export const ManagementButton = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-indigo-500 text-white hover:bg-indigo-400',
        secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
        outline: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800',
        danger: 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20',
        ghost: 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    };
    const sizes = {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-3.5 text-sm',
        lg: 'h-10 px-5 text-sm'
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
ManagementButton.displayName = 'ManagementButton';

export const ManagementCard = ({ className, children, ...props }) => (
    <section className={cn('management-card', className)} {...props}>
        {children}
    </section>
);

export const ManagementPageHeader = ({ eyebrow, title, description, actions }) => (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-400">{eyebrow}</p>}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
);

export const ManagementBadge = ({ children, tone = 'neutral' }) => {
    const tones = {
        neutral: 'bg-slate-800 text-slate-300',
        success: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
        info: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20',
        danger: 'bg-red-500/10 text-red-300 ring-1 ring-red-500/20'
    };
    return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>{children}</span>;
};

export const ManagementField = ({ label, hint, className, ...props }) => (
    <label className={cn('block space-y-1.5', className)}>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <input className="management-input h-10 w-full rounded-md px-3 text-sm outline-none transition" {...props} />
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
);

export const ManagementTextarea = ({ label, hint, className, ...props }) => (
    <label className={cn('block space-y-1.5', className)}>
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <textarea className="management-input min-h-24 w-full rounded-md px-3 py-2 text-sm outline-none transition" {...props} />
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
);

export const ManagementAlert = ({ children, tone = 'danger', onClose }) => (
    <div className={cn(
        'mb-5 flex items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm',
        tone === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
            : 'border-red-500/30 bg-red-500/10 text-red-200'
    )}>
        <span>{children}</span>
        {onClose && <button type="button" onClick={onClose} className="text-current/70 hover:text-current" aria-label="Dismiss">×</button>}
    </div>
);

export const ManagementStat = ({ label, value, detail, icon, tone = 'indigo' }) => (
    <ManagementCard className="p-4">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
                {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
            </div>
            <span className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md',
                tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-300' :
                    tone === 'amber' ? 'bg-amber-500/10 text-amber-300' :
                        tone === 'sky' ? 'bg-sky-500/10 text-sky-300' :
                            'bg-indigo-500/10 text-indigo-300'
            )}>
                {icon}
            </span>
        </div>
    </ManagementCard>
);
