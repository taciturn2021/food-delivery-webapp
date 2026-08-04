import React from 'react';
import { ArrowRight, Clock3, MapPin, Sparkles } from 'lucide-react';
import { CustomerLoading } from '../../../components/customer/CustomerStates';

const BranchSelector = ({ branches = [], onBranchSelect, currentBranchId, isDialog = false }) => {
    if (!branches.length) {
        return <CustomerLoading label="Finding nearby kitchens..." />;
    }

    return (
        <section className={isDialog ? 'p-5 sm:p-7' : 'customer-surface p-5 sm:p-8'}>
            <div className="mb-6 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--customer-soft)] text-[var(--customer-coral)]">
                    <Sparkles className="h-5 w-5" />
                </span>
                <div>
                    <p className="customer-eyebrow">Choose your table</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                        Where are we delivering?
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--customer-muted)]">
                        Pick a nearby branch to see its menu, availability, and delivery area.
                    </p>
                </div>
            </div>

            <div className="grid gap-3">
                {branches.map((branch) => {
                    const isSelected = branch.id === currentBranchId;
                    return (
                        <button
                            type="button"
                            key={branch.id}
                            onClick={() => onBranchSelect(branch.id)}
                            className={`group flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                                isSelected
                                    ? 'border-[var(--customer-coral)] bg-[var(--customer-selected)]'
                                    : 'border-[var(--customer-line)] bg-[var(--customer-surface)] hover:-translate-y-0.5 hover:border-[var(--customer-coral)] hover:shadow-lg'
                            }`}
                        >
                            <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                    <span className="truncate text-base font-bold">{branch.name}</span>
                                    {isSelected && (
                                        <span className="rounded-full bg-[var(--customer-sage-soft)] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[var(--customer-sage)]">
                                            Current
                                        </span>
                                    )}
                                </span>
                                <span className="mt-2 flex items-start gap-2 text-sm leading-5 text-[var(--customer-muted)]">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--customer-coral)]" />
                                    {branch.address}
                                </span>
                                <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-[var(--customer-sage)]">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {branch.opening_time?.slice(0, 5) || '09:00'} – {branch.closing_time?.slice(0, 5) || '22:00'}
                                    <span className="font-normal text-[var(--customer-muted)]">
                                        · {branch.delivery_radius || 10} km delivery area
                                    </span>
                                </span>
                            </span>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--customer-coral)] text-white transition group-hover:bg-[var(--customer-coral-dark)]">
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default BranchSelector;
