import React from 'react';
import { AlertCircle, Loader2, Search, UtensilsCrossed } from 'lucide-react';

export const CustomerLoading = ({ label = 'Getting things ready...' }) => (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 text-[var(--customer-muted)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--customer-sage-soft)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--customer-sage)]" />
        </span>
        <p className="text-sm">{label}</p>
    </div>
);

export const CustomerError = ({ message, onRetry }) => (
    <div className="customer-surface mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--customer-danger-soft)] text-[var(--customer-coral-dark)]">
            <AlertCircle className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-[var(--customer-muted)]">{message}</p>
        {onRetry && (
            <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-[var(--customer-coral)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--customer-coral-dark)]"
            >
                Try again
            </button>
        )}
    </div>
);

export const CustomerEmpty = ({
    title = 'Nothing here yet',
    description = 'We will have something delicious for you soon.',
    action
}) => (
    <div className="customer-surface mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--customer-soft)] text-[var(--customer-coral)]">
            <UtensilsCrossed className="h-6 w-6" />
        </span>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="max-w-sm text-sm leading-6 text-[var(--customer-muted)]">{description}</p>
        {action}
    </div>
);

export const CustomerNoResults = ({ query }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="mb-3 h-8 w-8 text-[var(--customer-muted)]" />
        <h3 className="font-semibold">No dishes found</h3>
        <p className="mt-1 text-sm text-[var(--customer-muted)]">
            Nothing matched {query ? `"${query}"` : 'your filters'}.
        </p>
    </div>
);
